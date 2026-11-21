


/**
 * click.ts = Click
 *
 * @summary
 * Helpers for reading a click. A link the page handles itself, such as a skip
 * link, should act only on a plain click and leave every other kind to the
 * browser, which opens a modified click its usual way.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

type CliEveTyp = Pick< MouseEvent, 'altKey' | 'button' | 'ctrlKey' | 'metaKey' | 'shiftKey' >; // What: Click Event Type. Why: Both a DOM click and a React click carry these fields. How: This picks them from the DOM's mouse event, which React's matches.

// #region modCliFun

/**
 * modCliFun = Modified Click Function
 *
 * @summary
 * Whether a click is one the browser should handle itself: a press of any
 * button but the main one, or a click with Alt, Ctrl, Cmd, or Shift held,
 * which opens a link in a new tab, a new window, or as a download. A handler
 * returns early when this is true, before cancelling the default.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.altKeyBoo - Alt Key Boolean: Whether Alt is held.
 * @param props.butIndNum - Button Index Number: Which button was pressed, 0
 *                          for the main one.
 * @param props.conKeyBoo - Control Key Boolean: Whether Ctrl is held.
 * @param props.metKeyBoo - Meta Key Boolean: Whether Cmd is held.
 * @param props.shiKeyBoo - Shift Key Boolean: Whether Shift is held.
 *
 * @returns Whether the click is a modified one.
 *
 * @example
 * ```ts
 * modCliFun(cliEveObj) // => true for a Ctrl click
 * ```
 *
*/

const modCliFun = ( { altKey : altKeyBoo, button : butIndNum, ctrlKey : conKeyBoo, metaKey : metKeyBoo, shiftKey : shiKeyBoo } : CliEveTyp ) : boolean => butIndNum !== 0 || altKeyBoo || conKeyBoo || metKeyBoo || shiKeyBoo; // What: Modified Click Function. Why: A modified click belongs to the browser. How: This is true for any button but the main one, or with a modifier key held.

// #endregion modCliFun

// #endregion Helpers



// #region Exports

export { modCliFun }; // What: Named Export. Why: A modified click needs one shared check. How: This exports modCliFun by name.

// #endregion Exports


