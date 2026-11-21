


/**
 * input.ts = Input
 *
 * @summary
 * Helpers for text fields. A field that opens holding a default value, such
 * as a new item's placeholder name, should offer that whole value ready to
 * be typed over.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region selAllFun

/**
 * selAllFun = Select All Function
 *
 * @summary
 * A ref callback that selects a text field's whole value as the field
 * mounts, so typing replaces it outright. React calls it with null when the
 * field unmounts, which it ignores. Declared at module level, it stays the
 * same function across renders, so React runs it only on mount and unmount.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param inpCurEle - Input Current Element: The mounted field, or null as it
 *                    unmounts.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * selAllFun(inpCurEle) // => void
 * ```
 *
*/

const selAllFun = ( inpCurEle : HTMLInputElement | null ) : void => { if ( inpCurEle ) inpCurEle.select(); }; // What: Select All Function. Why: A field holding a default value should be typed over rather than edited. How: This selects the mounted field's whole text, and does nothing for null.

// #endregion selAllFun

// #endregion Helpers



// #region Exports

export { selAllFun }; // What: Named Export. Why: A field that opens with a default value needs one shared ref callback. How: This exports selAllFun by name.

// #endregion Exports


