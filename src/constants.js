


/**
 * constants.js = Shared Constants
 *
 * @summary
 * Shared copy constants. Lives apart from the tabs so more than one tab
 * file can use the same string without importing each other.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const EUR_WAR_STR = 'WARNING: If this picker contains a lot of items then any given item will not always be picked within its range. This is due to the fact that there will be many items fully charged and competing to be picked. Items with shorter durations have a higher chance of being picked.'; // What: Ease-Up-Range Warning String. Why: Today's ease-up range InfoTip needs this exact warning text, kept in one shared place rather than duplicated inline. How: This is imported directly and passed as an InfoTip's own label prop.

// #endregion Constants



// #region Exports

export { EUR_WAR_STR }; // What: Named Exports. Why: The Today tab's ease-up range tips import this shared warning copy by name. How: This exports the file's only constant in one statement at the end of the file.

// #endregion Exports


