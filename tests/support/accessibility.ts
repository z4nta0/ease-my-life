


/**
 * accessibility.ts = Accessibility
 *
 * @summary
 * The accessibility targets the scanning specs share: the axe-core rule sets
 * a scan runs, for WCAG 2.2 AA plus axe's best practices, and the width the
 * reflow checks open a page at.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const AXE_TAG_ARR = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ]; // What: Axe Tag Array. Why: The app and its legal pages target WCAG 2.2 AA, which includes every earlier A and AA rule, and axe's best practices catch common problems WCAG doesn't name. How: This limits a scan to those rule sets.
const REF_WID_NUM = 320;                                                                         // What: Reflow Width Number. Why: WCAG's reflow criterion asks for no sideways scrolling at 320 CSS pixels, the width of 1,280px at 400% zoom. How: This is the viewport width a reflow check opens each page or state at.

// #endregion Constants



// #region Exports

export { AXE_TAG_ARR, REF_WID_NUM }; // What: Named Exports. Why: The app's, the legal pages', and the account screens' scans share one rule set, and the reflow checks share one width. How: This exports both by name.

// #endregion Exports


