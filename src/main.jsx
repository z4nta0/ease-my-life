


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library AppRooCom and its whole component tree are built on. How: This is required in scope for JSX to compile down to React.createElement calls, even though no other React API is called directly in this file.


import { AppRooCom  } from './app.jsx';        // What: App Root Component. Why: This is the single component the whole app renders as, owning every tab and overlay. How: This is rendered into the mounted root inside bootAppFun.
import { createRoot } from 'react-dom/client'; // What: Create Root. Why: This is the React 18 API for creating a concurrent-mode root to render into. How: This is called once against the #root DOM node inside bootAppFun.
import { STORAGE    } from './storage.js';     // What: Storage. Why: The mount must wait for persisted state to finish loading so store.jsx's own loadState() can stay synchronous. How: This is raced against a fixed timeout below so a slow or hung IndexedDB never blocks the app from booting at all.


import './fonts.css'; // What: Fonts Stylesheet Import. Why: The app's own stylesheets below assume the self-hosted font faces are already registered. How: This is imported first, purely for its side effect, so its @font-face rules register before styles.css/styles2.css are parsed.

import './styles.css';  // What: Styles Stylesheet Import. Why: This is the app's own primary stylesheet. How: This is imported purely for its side effect of registering its rules against the document.
import './styles2.css'; // What: Styles2 Stylesheet Import. Why: This is the app's own secondary stylesheet, split from styles.css. How: This is imported purely for its side effect of registering its rules against the document.

// #endregion Imports



// #region bootAppFun

/**
 * bootAppFun = Boot App Function
 *
 * @summary
 * This is the app's actual mount step, called once storage has resolved (or
 * the race below has given up waiting on it). It creates the single React 18
 * root on the #root DOM node and renders AppRooCom into it, then lets the
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
 * bootAppFun() // => undefined
 * ```
 *
*/

function bootAppFun () {


	createRoot( document.getElementById( 'root' ) ).render( <AppRooCom /> ); // What: Root Render Call. Why: This is the app's actual first mount, deferred until storage has resolved or the race below has given up waiting on it. How: This creates a React root on the #root DOM node and renders AppRooCom into it.


	requestAnimationFrame( () => setTimeout( () => { if ( window.__dismissBootSplash ) window.__dismissBootSplash(); }, 180 ) ); // What: Boot Splash Dismiss Schedule Call. Why: The boot splash should hold through the app's first paint settling instead of vanishing the instant React mounts. How: This waits one animation frame for paint, then a further 180ms matching the splash's own fade timing, before calling its exposed dismiss hook if index.html's boot script has registered one.


}

// #endregion bootAppFun



Promise.race( [ // What: Boot Race Array. Why: Gating the mount on storage init lets store.jsx's own loadState() stay synchronous, but a hung IndexedDB open must never block the app from booting at all. How: This races STORAGE.init() against a fixed 3500ms timeout and calls bootAppFun either way, once whichever settles first.


	STORAGE.init(),                                                // What: Storage Init Call. Why: This is the real, awaited condition: persisted state finishing its load. How: This resolves once storage.js has parked the loaded state in memory for store.jsx to read synchronously.
	new Promise( ( resRacFun ) => setTimeout( resRacFun, 3500 ) ), // What: Storage Timeout Fallback Promise. Why: The mount must never wait forever on a hung IndexedDB open. How: This resolves on its own after 3500ms regardless of whether STORAGE.init() has settled.


] ).then( bootAppFun, bootAppFun ); // What: Boot Promise Then Call. Why: bootAppFun must run exactly once no matter which side of the race settled first. How: This passes bootAppFun as both the fulfillment and rejection handler, treating a hung/slow IndexedDB the same as a successful init.


