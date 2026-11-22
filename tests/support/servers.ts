


// #region Imports

import { fileURLToPath } from 'node:url'; // What: File URL To Path. Why: The repo root sits two folders above this file. How: This turns that folder's URL into a path.

// #endregion Imports



/**
 * servers.ts = Servers
 *
 * @summary
 * Where the test run's servers live, such as the address the preview server
 * answers on, serving the production build. It imports only Node's own
 * modules, so the Playwright config can load it before any test runs.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const PRE_URL_STR = 'http://localhost:5191';                              // What: Preview URL String. Why: Checks of what ships read the production build rather than the dev server. How: This is the address the preview server answers on.
const ROO_DIR_STR = fileURLToPath( new URL( '../..', import.meta.url ) ); // What: Root Directory String. Why: The servers and npm work from the repo root, where vite.config.ts and the lockfile live. How: This resolves the folder two above this file.

// #endregion Constants



// #region Exports

export { PRE_URL_STR, ROO_DIR_STR }; // What: Named Exports. Why: The preview address and the repo root are set in one place. How: This exports them by name.

// #endregion Exports


