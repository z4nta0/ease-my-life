


// #region Imports

import { chromium      } from '@playwright/test'; // What: Chromium. Why: Every design image is drawn or captured in a real browser. How: This launches Playwright's Chromium.
import { createServer  } from 'vite';             // What: Create Server. Why: A card that reads the app's own font and token stylesheets needs Vite to serve them. How: This starts a dev server from the repo root.
import { fileURLToPath } from 'node:url';         // What: File URL To Path. Why: The Vite server runs from the repo root. How: This turns the root's file URL into a path.


import type { Browser       } from '@playwright/test'; // What: Browser. Why: A caller closes the browser it was handed once its image is saved. How: This types the launched browser.
import type { Page          } from '@playwright/test'; // What: Page. Why: A caller draws or captures in the page it was handed. How: This types the opened page.
import type { ViteDevServer } from 'vite';             // What: Vite Dev Server. Why: A caller closes the server it was handed once its image is saved. How: This types the started server.

// #endregion Imports



/**
 * render-kit.mts = Render Kit
 *
 * @summary
 * The setup every design render script shares: opening a Chromium page to
 * draw or capture in, and starting the Vite server a card needs when it reads
 * the app's own stylesheets from the repo root. Each script beside it imports
 * what it needs and still runs on its own with node, then closes what it was
 * handed once its image is saved.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ROO_DIR_STR = fileURLToPath( new URL( '..', import.meta.url ) ); // What: Root Directory String. Why: Vite serves the app's stylesheets from the repo root. How: This resolves one folder up from the design folder.
const VIT_POR_NUM = 5199;                                              // What: Vite Port Number. Why: The render server gets a port of its own, apart from the dev and test servers. How: The server holds it strictly, failing rather than moving.
const VIT_URL_STR = `http://localhost:${ VIT_POR_NUM }`;               // What: Vite URL String. Why: A card is opened from the render server. How: This is the server's address, with a card's repo path added after it.

// #endregion Constants



// #region Helpers

type OcfResTyp = { broInsObj : Browser, capPagObj : Page }; // What: Open-Capture-Function Result Type. Why: A caller keeps the browser to close and the page to work in. How: This is the launched browser and its opened page.

// #region opeCapFun

/**
 * opeCapFun = Open Capture Function
 *
 * @summary
 * Launches Chromium and opens one page in it, at the given viewport size
 * when one is named, or at Playwright's default size otherwise, for a page
 * that only draws on a canvas. The caller closes the browser once its image
 * is saved.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param vieSizObj - Viewport Size Object: The page's height and width in
 *                    pixels, or nothing for the default size.
 *
 * @returns A promise that resolves with the browser and its page.
 *
 * @example
 * ```ts
 * opeCapFun({ height : 630, width : 1200 }) // => { broInsObj, capPagObj }
 * ```
 *
*/

async function opeCapFun ( vieSizObj? : { height : number, width : number } ) : Promise< OcfResTyp > {


	const broInsObj = await chromium.launch();                                                     // What: Browser Instance Object. Why: The image is drawn by a real browser. How: This launches Chromium headless.
	const capPagObj = await broInsObj.newPage( vieSizObj ? { viewport : vieSizObj } : undefined ); // What: Capture Page Object. Why: The drawing or capture runs inside a page. How: This opens one at vieSizObj's size, or the default when none is named.



	return { broInsObj, capPagObj }; // What: Browser And Page Return. Why: The caller works in the page and closes the browser. How: This returns both under their own names, so a caller destructures them as they are.


}

// #endregion opeCapFun



// #region staVitFun

/**
 * staVitFun = Start Vite Function
 *
 * @summary
 * Starts a Vite dev server from the repo root on its own port, listening, so
 * a card can load the app's font and token stylesheets by their repo paths
 * under VIT_URL_STR. The caller closes the server once its image is saved.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that resolves with the listening server.
 *
 * @example
 * ```ts
 * staVitFun() // => vitSerObj
 * ```
 *
*/

async function staVitFun () : Promise< ViteDevServer > {


	const vitSerObj = await createServer( { logLevel : 'error', root : ROO_DIR_STR, server : { port : VIT_POR_NUM, strictPort : true } } ); // What: Vite Server Object. Why: The card's stylesheet links need a server. How: This creates Vite at the repo root on its own port, quiet but for errors.


	await vitSerObj.listen(); // What: Server Listen Call. Why: The browser loads the card from it. How: This starts listening.



	return vitSerObj; // What: Server Return. Why: The caller closes the server once its image is saved. How: This returns the listening server.


}

// #endregion staVitFun

// #endregion Helpers



// #region Exports

export { opeCapFun, staVitFun, VIT_URL_STR }; // What: Named Exports. Why: The design render scripts share their browser and server setup. How: This exports the page opener, the server starter, and the server's address by name.

// #endregion Exports


