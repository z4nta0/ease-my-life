


// #region Imports

import { AppRooCom   } from './app.jsx';          // What: App Root Component. Why: This is the single component the whole app renders as, owning every tab and overlay. How: This is rendered into the mounted root inside booAppFun.
import { createRoot  } from 'react-dom/client';   // What: Create Root. Why: This is the React 18 API for creating a concurrent-mode root to render into. How: This is called once against the #root DOM node inside booAppFun.
import { STG_NAM_OBJ } from './state/storage.js'; // What: Storage Namespace Object. Why: The mount must wait for persisted state to finish loading so store.js's own loaStaFun() can stay synchronous. How: This is raced against a fixed timeout below so a slow or hung IndexedDB never blocks the app from booting at all.


import './styles/fonts.css'; // What: Fonts Stylesheet Import. Why: The app's own stylesheets below assume the self-hosted font faces are already registered. How: This is imported first, purely for its side effect, so its @font-face rules register before styles.css is parsed.

import './styles/styles.css'; // What: Styles Stylesheet Import. Why: This is the app's own global stylesheet, holding the tokens, base styles, shared keyframes, and body-level state every CSS module relies on. How: This is imported purely for its side effect of registering its rules against the document.

// #endregion Imports



/**
 * main.jsx = Main
 *
 * @summary
 * The app's real entry point, imported nowhere else. It races
 * STG_NAM_OBJ.iniStoFun() against a fixed 3500ms timeout so a hung
 * IndexedDB open never blocks booting, then calls booAppFun either way
 * once whichever settles first.
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
 * This is the app's actual mount step, called once storage has resolved (or
 * the race below has given up waiting on it). It creates the single React 18
 * root on the #appMouDiv DOM node and renders AppRooCom into it, then lets the
 * first paint settle before releasing the boot splash: a plain CSS/inline-JS
 * overlay defined in index.html, dismissed by calling its own exposed
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

function booAppFun () {


	createRoot( document.getElementById( 'appMouDiv' ) ).render( <AppRooCom /> ); // What: Root Render Call. Why: This is the app's actual first mount, deferred until storage has resolved or the race below has given up waiting on it. How: This creates a React root on the #appMouDiv DOM node and renders AppRooCom into it.



	requestAnimationFrame( () => setTimeout( () => { if ( window.__dismissBootSplash ) window.__dismissBootSplash(); }, 180 ) ); // What: Boot Splash Dismiss Schedule Call. Why: The boot splash should hold through the app's first paint settling instead of vanishing the instant React mounts. How: This waits one animation frame for paint, then a further 180ms matching the splash's own fade timing, before calling its exposed dismiss hook if index.html's boot script has registered one.


}

// #endregion booAppFun

// #endregion Helpers



// #region Module Init

Promise.race( [ // What: Boot Race Array. Why: Gating the mount on storage init lets store.js's own loaStaFun() stay synchronous, but a hung IndexedDB open must never block the app from booting at all. How: This races STG_NAM_OBJ.iniStoFun() against a fixed 3500ms timeout and calls booAppFun either way, once whichever settles first.


	STG_NAM_OBJ.iniStoFun(),                                       // What: Storage Init Call. Why: This is the real, awaited condition: persisted state finishing its load. How: This resolves once storage.js has parked the loaded state in memory for store.js to read synchronously.
	new Promise( ( resRacFun ) => setTimeout( resRacFun, 3500 ) )  // What: Storage Timeout Fallback Promise. Why: The mount must never wait forever on a hung IndexedDB open. How: This resolves on its own after 3500ms regardless of whether STG_NAM_OBJ.iniStoFun() has settled.


] ).then( booAppFun, booAppFun ); // What: Boot Promise Then Call. Why: booAppFun must run exactly once no matter which side of the race settled first. How: This passes booAppFun as both the fulfillment and rejection handler, treating a hung/slow IndexedDB the same as a successful init.

// #endregion Module Init


