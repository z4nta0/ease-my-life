


// #region Imports

import { fileURLToPath } from 'node:url';          // What: File URL To Path. Why: The PNG lands beside this file. How: This turns its URL into a path.
import { opeCapFun     } from '../render-kit.mts'; // What: Open Capture Function. Why: The card is drawn by a real browser. How: This launches Chromium and opens the card's page.
import { statSync      } from 'node:fs';           // What: Stat Sync. Why: The render reports the file's size. How: This reads it once written.
import { staVitFun     } from '../render-kit.mts'; // What: Start Vite Function. Why: The card reads the app's own font and token stylesheets, which Vite serves. How: This starts the render server from the repo root.
import { VIT_URL_STR   } from '../render-kit.mts'; // What: Vite URL String. Why: The card is opened from the render server. How: This is the server's address, with the card's repo path after it.

// #endregion Imports



/**
 * render.mts = Sync Image Render
 *
 * @summary
 * Renders card.html, the Ease My Life Sync product image for Polar's
 * checkout, to sync-image.png beside it: a 1,200px square drawn from the
 * app's own fonts, colors, and swoosh mark. Run it from the repo root with
 * `npx tsx design/sync-image/render.mts` after changing the card.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const OUT_PAT_STR = fileURLToPath( new URL( './sync-image.png', import.meta.url ) ); // What: Output Path String. Why: The PNG is uploaded to Polar by hand. How: This writes it beside the card.



const vitSerObj = await staVitFun(); // What: Vite Server Object. Why: The card's stylesheet links need a server. How: This is the render server the kit started, already listening.



const { broInsObj, capPagObj } = await opeCapFun( { height : 1200, width : 1200 } ); // What: Browser Instance Object. Why: The card is screenshotted by Chromium. How: This is the Chromium the kit launched headless. // What: Capture Page Object. Why: The card fills a 1,200px square. How: This is a page opened that size.


await capPagObj.goto( `${ VIT_URL_STR }/design/sync-image/card.html` ); // What: Card Load Call. Why: The card has to render first. How: This opens it.

await capPagObj.evaluate( () => document.fonts.ready.then( () => undefined ) ); // What: Font Wait Call. Why: The brand fonts must be drawn, not their fallbacks. How: This waits for every font to load.

await capPagObj.locator( '#carSqaDiv' ).screenshot( { path : OUT_PAT_STR } ); // What: Card Screenshot Call. Why: This is the image itself. How: This captures the card element as a PNG.



await broInsObj.close(); // What: Browser Close Call. Why: The render is done. How: This closes Chromium.

await vitSerObj.close(); // What: Server Close Call. Why: The render is done. How: This stops Vite.



console.log( `Wrote ${ OUT_PAT_STR } (${ Math.round( statSync( OUT_PAT_STR ).size / 1024 ) } KB)` ); // What: Result Log Call. Why: The size is worth knowing before uploading. How: This prints the path and size in KB.


