


// #region Imports

import { chromium      } from '@playwright/test'; // What: Chromium. Why: Every design image is drawn or captured in a real browser. How: This launches Playwright's Chromium.
import { createServer  } from 'vite';             // What: Create Server. Why: A card that reads the app's own font and token stylesheets needs Vite to serve them. How: This starts a dev server from the repo root.
import { fileURLToPath } from 'node:url';         // What: File URL To Path. Why: The Vite server runs from the repo root. How: This turns the root's file URL into a path.
import { statSync      } from 'node:fs';          // What: Stat Sync. Why: A square card's render reports the file's size. How: This reads it once written.


import type { Browser       } from '@playwright/test'; // What: Browser. Why: A caller closes the browser it was handed once its image is saved. How: This types the launched browser.
import type { Page          } from '@playwright/test'; // What: Page. Why: A caller draws or captures in the page it was handed. How: This types the opened page.
import type { ViteDevServer } from 'vite';             // What: Vite Dev Server. Why: A caller closes the server it was handed once its image is saved. How: This types the started server.

// #endregion Imports



/**
 * render-kit.mts = Render Kit
 *
 * @summary
 * The setup the design render scripts share: opening a Chromium page to draw
 * or capture in, starting the Vite server a card needs when it reads the
 * app's own stylesheets from the repo root, and the whole capture of a square
 * product card. Each script beside it imports what it needs and still runs on
 * its own with node, then closes what it was handed once its image is saved.
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



// #region renCarFun

/**
 * renCarFun = Render Card Function
 *
 * @summary
 * Captures a 1,200px square product card to a PNG: it starts the render
 * server, opens the card.html in the given folder at that size, waits for its
 * fonts, screenshots its #carSquDiv element to the output path, closes the
 * browser and the server, and logs the file's size in KB.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param carDirStr - Card Directory String: The card's folder, as a path from
 *                    the repo root.
 * @param outPatStr - Output Path String: The file path the PNG is written to.
 *
 * @returns A promise that settles once the image is written and both the
 *          browser and the server are closed, with no value.
 *
 * @example
 * ```ts
 * renCarFun('design/sync-image', OUT_PAT_STR) // => Promise<void>
 * ```
 *
*/

async function renCarFun ( carDirStr : string, outPatStr : string ) : Promise< void > {


	const vitSerObj = await staVitFun(); // What: Vite Server Object. Why: The card's stylesheet links need a server. How: This is the render server, already listening.



	const { broInsObj, capPagObj } = await opeCapFun( { height : 1200, width : 1200 } ); // What: Browser Instance Object. Why: The card is screenshotted by Chromium. How: This is the Chromium launched headless. // What: Capture Page Object. Why: The card fills a 1,200px square. How: This is a page opened that size.


	await capPagObj.goto( `${ VIT_URL_STR }/${ carDirStr }/card.html` ); // What: Card Load Call. Why: The card has to render first. How: This opens the card in carDirStr.

	await capPagObj.evaluate( () => document.fonts.ready.then( () => undefined ) ); // What: Font Wait Call. Why: The brand fonts must be drawn, not their fallbacks. How: This waits for every font to load.

	await capPagObj.locator( '#carSquDiv' ).screenshot( { path : outPatStr } ); // What: Card Screenshot Call. Why: This is the image itself. How: This captures the card element as a PNG.



	await broInsObj.close(); // What: Browser Close Call. Why: The render is done. How: This closes Chromium.

	await vitSerObj.close(); // What: Server Close Call. Why: The render is done. How: This stops Vite.



	console.log( `Wrote ${ outPatStr } (${ Math.round( statSync( outPatStr ).size / 1024 ) } KB)` ); // What: Result Log Call. Why: The size is worth knowing before uploading. How: This prints the path and size in KB.


}

// #endregion renCarFun

// #endregion Helpers



// #region Exports

export { opeCapFun, renCarFun }; // What: Named Exports. Why: The design render scripts share their browser setup and the square card capture. How: This exports the page opener and the card renderer by name.

// #endregion Exports


