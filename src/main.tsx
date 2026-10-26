


// #region Imports

import { AppRooCom   } from './app.tsx';          // What: App Root Component. Why: This is the single component the whole app renders as, owning every tab and overlay. How: This is rendered into the mounted root inside booAppFun.
import { createRoot  } from 'react-dom/client';   // What: Create Root. Why: This is the React 18 API for creating a concurrent-mode root to render into. How: This is called once against the #root DOM node inside booAppFun.
import { STG_NAM_OBJ } from './state/storage.ts'; // What: Storage Namespace Object. Why: The mount must wait for persisted state to finish loading so store.ts's own loaStaFun() can stay synchronous. How: This is awaited below, and its own boot deadline keeps a slow or hung IndexedDB from blocking the app.


import './styles/fonts.css';  // What: Fonts Stylesheet Import. Why: The app's own stylesheets below assume the self-hosted font faces are already registered. How: This is imported first, purely for its side effect, so its @font-face rules register before styles.css is parsed.
import './styles/styles.css'; // What: Styles Stylesheet Import. Why: This is the app's own global stylesheet, holding the tokens, base styles, shared keyframes, and body-level state every CSS module relies on. How: This is imported purely for its side effect of registering its rules against the document.

// #endregion Imports



/**
 * main.tsx = Main
 *
 * @summary
 * The app's real entry point, imported nowhere else. It first replaces any
 * address but the root with the root, since the host serves the app at every
 * path and the app answers only at its root. It then awaits
 * STG_NAM_OBJ.iniStoFun(), which gives up on a slow or hung IndexedDB by
 * itself and falls back to localStorage, then calls booAppFun either way.
 * The deadline lives in storage.ts rather than here, so the app can never
 * mount from the localStorage mirror while IndexedDB finishes loading
 * behind it and takes over its saves.
 *
 * booAppFun creates the single React 18 root on the #appMouDiv DOM node,
 * renders AppRooCom into it, and dismisses index.html's own boot splash (a
 * plain CSS/inline-JS overlay, not React) once the first paint has had a
 * chance to settle.
 *
 * Sections:
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region booAppFun

/**
 * booAppFun = Boot App Function
 *
 * @summary
 * This is the app's actual mount step, called once storage has settled on
 * IndexedDB or localStorage. It creates the single React 18 root on the
 * #appMouDiv DOM node and renders AppRooCom into it, then lets the first paint
 * settle before releasing the boot splash: a plain CSS/inline-JS overlay
 * defined in index.html, dismissed by calling its own exposed
 * window.__dismissBootSplash hook after one animation frame plus a further
 * 180ms matching the splash's own fade timing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * booAppFun() // => void
 * ```
 *
*/

function booAppFun () : void {


	createRoot( document.getElementById( 'appMouDiv' )! ).render( <AppRooCom /> ); // What: Root Render Call. Why: This is the app's actual first mount, deferred until storage has settled on IndexedDB or localStorage. How: This creates a React root on the #appMouDiv DOM node and renders AppRooCom into it. // What: Non-Null Note. Why: index.html always ships the appMouDiv mount point. How: The ! tells TypeScript the element is found.



	requestAnimationFrame( () => setTimeout( () => { if ( window.__dismissBootSplash ) window.__dismissBootSplash(); }, 180 ) ); // What: Boot Splash Dismiss Schedule Call. Why: The boot splash should hold through the app's first paint settling instead of vanishing the instant React mounts. How: This waits one animation frame for paint, then a further 180ms matching the splash's own fade timing, before calling its exposed dismiss hook if index.html's boot script has registered one.


}

// #endregion booAppFun

// #endregion Helpers



// #region Module Init

if ( window.location.pathname !== '/' ) window.history.replaceState( null, '', `/${ window.location.search }${ window.location.hash }` ); // What: Unknown Path Cleanup. Why: The host serves the app at every address, so a mistyped or outdated one would otherwise stay in the address bar while the app shows its usual screen. How: This replaces any path but the root with the root before anything reads the address, keeping the query and hash a sign-in link or a checkout return carries, without adding a history entry.



STG_NAM_OBJ.iniStoFun().then( booAppFun, booAppFun ); // What: Boot Promise Then Call. Why: The mount waits for storage so store.ts's own loaStaFun() can stay synchronous, and iniStoFun itself gives up on a slow IndexedDB in time, so the app boots on exactly one engine. How: This calls booAppFun once storage settles, as both the fulfillment and rejection handler.

// #endregion Module Init


