


/**
 * motion.js = Motion
 *
 * @summary
 * The reduced-motion check every animation in the app consults before playing:
 * whether the user's operating system asks for reduced motion. It reads the
 * live media query each time, so a change to the setting takes effect without
 * a reload.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region redMotFun

/**
 * redMotFun = Reduce Motion Function
 *
 * @summary
 * Whether the user asked their system for reduced motion. JS-driven
 * animations (rAF tweens, Element.animate, smooth scrolls) check this,
 * since the CSS media query alone can't stop them. It reads the live
 * setting on every call, so a change takes effect immediately.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns Whether reduced motion is requested.
 *
 * @example
 * ```ts
 * redMotFun() // => true or false
 * ```
 *
*/

const redMotFun = () => !!( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ); // What: Reduce Motion Function. Why: JS-driven animations (rAF tweens, Element.animate, smooth scrolls) must check this since the CSS media query alone never reaches them. How: This reports whether the OS's prefers-reduced-motion media query currently matches reduce.

// #endregion redMotFun

// #endregion Helpers



// #region Exports

export { redMotFun }; // What: Named Export. Why: Every animated component checks the same reduced-motion preference. How: This exports redMotFun by name.

// #endregion Exports


