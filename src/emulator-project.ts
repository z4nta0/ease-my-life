


/**
 * emulator-project.ts = Emulator Project
 *
 * @summary
 * The ID of the demo project the Firebase Emulator serves, shared by the app,
 * the Netlify Functions, and the test suites. It lives apart from
 * constants.ts because it has no imports and reads no build-time values, so
 * a bundled function and a script under Node's own runner can load it too.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const EMU_PRO_STR = 'demo-ease-my-life'; // What: Emulator Project String. Why: The emulator serves a demo project, which can never reach a real one. How: This is its ID, whose demo- prefix names it a demo project to the Firebase tools.

// #endregion Constants



// #region Exports

export { EMU_PRO_STR }; // What: Named Export. Why: The emulator's project name is set in one place. How: This exports EMU_PRO_STR by name.

// #endregion Exports


