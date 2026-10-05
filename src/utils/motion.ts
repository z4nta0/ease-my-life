


/**
 * motion.ts = Motion
 *
 * @summary
 * The reduced-motion check every animation in the app consults before playing:
 * whether the user's operating system asks for reduced motion. It reads the
 * live media query each time, so a change to the setting takes effect without
 * a reload. It also reads the stylesheet's easing curves, for motion that
 * JavaScript plays itself.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region motEasFun

/**
 * motEasFun = Motion Easing Function
 *
 * @summary
 * The easing curve of one --mot-*-eas family, read from the stylesheet, for
 * motion JavaScript plays itself (an Element.animate call), which can't read a
 * custom property through var(). The family is the token's middle segment:
 * 'sta' (standard), 'dec' (decelerate), 'acc' (accelerate), 'ove' (gentle
 * overshoot), or 'bou' (bounce). It falls back to the browser's own ease
 * curve when the token can't be read.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param easFamStr - Easing Family String: The family's 3-letter name, e.g.
 *                    'dec'.
 *
 * @returns The family's curve as a CSS easing string.
 *
 * @example
 * ```ts
 * motEasFun('dec') // => 'cubic-bezier( .2, .7, .3, 1 )'
 * ```
 *
*/

const motEasFun = ( easFamStr : string ) : string => getComputedStyle( document.documentElement ).getPropertyValue( `--mot-${ easFamStr }-eas` ).trim() || 'ease'; // What: Motion Easing Function. Why: Element.animate can't read a custom property, yet its curves should match the stylesheet's. How: This reads the family's token from the root element's computed style, falling back to ease.

// #endregion motEasFun



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

const redMotFun = () : boolean => !!( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ); // What: Reduce Motion Function. Why: JS-driven animations (rAF tweens, Element.animate, smooth scrolls) must check this since the CSS media query alone never reaches them. How: This reports whether the OS's prefers-reduced-motion media query currently matches reduce.

// #endregion redMotFun

// #endregion Helpers



// #region Exports

export { motEasFun, redMotFun }; // What: Named Exports. Why: Every animated component checks the same reduced-motion preference, and JS-played motion reads the same curves as the stylesheet. How: This exports motEasFun and redMotFun by name.

// #endregion Exports


