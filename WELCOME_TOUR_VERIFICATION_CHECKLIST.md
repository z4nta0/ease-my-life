# Welcome Tour manual verification checklist (post-extraction)

Context: the Welcome Tour's spotlight/coach engine was extracted out of
`onboarding.jsx` into a generic, reusable `<GuidedTour>`
(`src/onboarding-tour-runner.jsx`) plus a generic `<TutorialIntroModal>`
(`src/onboarding-intro-modal.jsx`), so future mini-tours (Reminders, Pickers,
Page Tours) can reuse the same engine instead of duplicating it. `onboarding.jsx`
now only holds Welcome-Tour-specific content (the 8 steps' text/targets,
sample-seeding, back-navigation cleanup) and calls into the shared engine.

The refactor also changed *how* steps advance internally: each step's `run()`
used to call `setStep()`/`selectTab()` itself; now it's a pure side effect and
navigation (advance, tab-switch, resume, back) is fully generic. That's the
part with the most real risk of behavior drift, so the checklist below leans
on exercising navigation edge cases, not just reading each step's copy.

**Setup**: Settings → Data control → Reset all data → confirm, then **reload
the page** (reset alone won't reseed samples until the tab remounts — this is
a pre-existing quirk, not new). You should land on Today with the welcome
modal open.

## 1. Welcome modal
- [ ] Icon, "Welcome to Ease My Life" title, body text, 3 pills, "Take the
      quick tour" (blue) over "I'll explore myself" (white) all render.
- [ ] "I'll explore myself" closes the modal with no tour starting, and
      doesn't reopen on next reload.
- [ ] Reset again, reload, this time click "Take the quick tour" — Step 1
      begins immediately (no flash of a blank/undimmed page first).

## 2. Forward walkthrough, Steps 1-8
Click "Next" through all 8 steps and confirm for each:
- [ ] Step counter reads "Step N of 8" correctly.
- [ ] The highlighted element matches what the step's text describes.
- [ ] The right tab is active for that step (Today → Today → Today → Pickers
      → Stats → Data → Settings → Today).
- [ ] Step 2 ("Todo list generation"): clicking Next actually triggers a real
      Regenerate — after landing on Step 3, Today shows real generated
      content (Reminders count > 0, other groups populated), not blank.
- [ ] Step 3 / Step 8 scroll the page to the top before showing their coach
      (both are tall/full-page highlights).
- [ ] Step 7 (Settings): after Next, the sample pickers/tasks become hidden
      (check Pickers tab afterward, or just proceed — Step 8's checklist
      shouldn't show leftover sample clutter).
- [ ] Step 8: "Done" (not "Next") is the primary button; clicking it closes
      the tour entirely and returns to normal Today.

## 3. Back navigation
- [ ] From any step ≥ 2, "Back" moves to the previous step and re-highlights
      correctly (no stale highlight from the old step lingering).
- [ ] Go forward to Step 3+ (so Regenerate has run), then Back all the way to
      Step 2: Today should return to the **pristine** state — 0/0 reminders,
      only the empty Reminders group visible, no other groups, no "List
      generated" line. (This is the exact case the refactor's `onGoBack`
      logic handles — worth checking closely.)
- [ ] Back from Step 2 to Step 1: reminder tasks added by Step 2 are removed
      entirely (not just hidden) and Today's entries are cleared.
- [ ] From Step 1, Back is disabled/hidden (can't go before Step 1).

## 4. Skip
- [ ] "Skip" from any step closes the tour immediately, marks onboarding as
      welcomed (doesn't reopen the welcome modal on reload).
- [ ] Sample pickers created for the tour remain (just not force-shown by the
      tour anymore) — check Pickers tab.

## 5. Resume across reload
- [ ] Start the tour, advance to Step 4 (Pickers), then reload the page.
- [ ] You should land back on Step 4 of 8 with the Pickers tab active and the
      same element highlighted — not restarted from Step 1, not dropped back
      to the welcome modal.

## 6. Click-guard
- [ ] While the tour is active, try clicking something unrelated to the
      current step (e.g. open Edit Mode on Today during an early step) — it
      should be blocked/no-op.
- [ ] Clicking the actual highlighted target (or the coach card's own
      buttons) still works normally.
- [ ] After the tour ends (Skip or Done), normal clicks everywhere work again
      immediately.

## 7. Mobile / narrow layout
- [ ] Resize to a narrow/mobile width. On steps that highlight a nav button
      inside the collapsible rail (e.g. Pickers/Stats/Data/Settings steps),
      the rail auto-opens to reveal the target and auto-closes when moving to
      a step that doesn't need it.
- [ ] The coach card never gets clipped off-screen top/bottom; the tab bar at
      the bottom is never covered/blocked by the dimming overlay.

## 8. Replay Tour
- [ ] With a normal (non-fresh) account that has its own real pickers/tasks,
      go to Settings → Replay Tour.
- [ ] The welcome modal reopens; starting it again runs the full 8 steps
      without erroring, and — importantly — Back navigation during a replay
      should NOT delete or hide the user's own real pickers/tasks (only the
      tour's own sample data, if any, should be touched).

## 9. Not-found watchdog
- [ ] Mid-tour, do something unusual that could make a step's target
      temporarily missing (e.g. spam-click Regenerate right as a step
      referencing `.gen-confirm` is showing). The tour should recover/wait
      rather than getting stuck highlighting nothing indefinitely.

---
Already verified from this end (screenshots + IndexedDB checks): welcome
modal, all 8 forward steps' copy/highlight/tab-sync, Step 2 Regenerate
producing real content, Step 8 checklist + bottom clamp, click-guard block +
release, `activeTour` correctly cleared on finish, resume-after-reload to
Step 4, and Back-to-Step-2 producing a genuine pristine restore (confirmed via
IndexedDB: pickers preserved-but-hidden, tasks removed, entries cleared).
Sections 7-9 above (mobile rail, Replay Tour, not-found watchdog) reuse code
that moved to the new file unchanged, but weren't re-exercised against the
new engine this round — worth a quick pass on your end.
