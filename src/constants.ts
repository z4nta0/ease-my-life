


/**
 * constants.ts = Shared Constants
 *
 * @summary
 * Shared constants: copy and values that more than one file needs. Lives
 * apart from the tabs so they can share a value without importing each
 * other.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

/**
 * APP_VER_STR = App Version String
 *
 * @summary
 * Injected from package.json's own "version" field at build time by
 * vite.config.ts (see __APP_VERSION__), so `npm version` stays the
 * single source of truth and the About section can never drift from
 * the actual build. The typeof guard keeps this rendering a sane fallback
 * if the define is ever missing, such as running a file outside the
 * real Vite build.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const APP_VER_STR = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : null; // What: App Version String. Why: The About section and the support form's diagnostic field both need the real build version, never a hand-maintained copy. How: This reads the build-time __APP_VERSION__ define, falling back to null when it is missing.



const EUR_WAR_STR = 'WARNING: If this picker contains a lot of items then any given item will not always be picked within its range. This is due to the fact that there will be many items fully charged and competing to be picked. Items with shorter durations have a higher chance of being picked.'; // What: Ease-Up-Range Warning String. Why: Today's ease-up range InfTipCom needs this exact warning text, kept in one shared place rather than duplicated inline. How: This is imported directly and passed as an InfTipCom's own label prop.



const SYN_PRI_STR = '$9.99'; // What: Sync Price String. Why: The Account section names the sync upgrade's price before anyone opens the checkout. How: This is the one-time price, which must match the Polar product and index.html's structured data.



const THR_VAL_NUM = 100; // What: Threshold Value Number. Why: Every ease drift/day conversion and full-charge check across the app shares this one fixed ceiling value. How: This is divided by an item's own easeMin/easeMax to get a day count, and compared against an item's own charge value.



/**
 * TIP_URL_STR = Tip URL String
 *
 * @summary
 * The address of the Ko-fi page behind the About section's Buy Me a Coffee
 * button. It's read from the VITE_TIP_URL build setting rather than written
 * here, so the button can ship before the page exists and the address can
 * change without a code change. Netlify supplies it to the production build,
 * the test suites supply a placeholder, and a build without it shows the
 * button disabled as Coming Soon.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TIP_URL_STR = import.meta.env.VITE_TIP_URL || null; // What: Tip URL String. Why: The Buy Me a Coffee button opens the Ko-fi tip page. How: This reads the VITE_TIP_URL build setting, falling back to null when it isn't set.

// #endregion Constants



// #region Exports

export { APP_VER_STR, EUR_WAR_STR, SYN_PRI_STR, THR_VAL_NUM, TIP_URL_STR }; // What: Named Exports. Why: Settings shows the build version, links the Ko-fi tip page, and names the sync price, the Today tab's ease tips share the warning copy, and every ease day-range calculation shares the threshold value. How: This exports all four constants by name for any file to import.

// #endregion Exports


