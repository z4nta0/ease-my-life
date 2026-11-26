


// #region Imports

import { fileURLToPath } from 'node:url';          // What: File URL To Path. Why: The output path is resolved from this script's own location. How: This turns a file URL into a path.
import { opeCapFun     } from '../render-kit.mts'; // What: Open Capture Function. Why: The image is captured in a real browser, in the app's own fonts and tokens. How: This launches Chromium and opens the capture page.
import { statSync      } from 'node:fs';           // What: Stat Sync. Why: The image has to stay under the 300 KB limit. How: This reads the saved image's size in bytes.

// #endregion Imports



/**
 * render.mts = Social Preview Image Renderer
 *
 * @summary
 * Rebuilds the app's link preview image, a 1,200x630 PNG, since it's flat
 * artwork, captured from card.html beside this script in the app's own fonts
 * and tokens. It shows the checkmark mark, the Ease My Life wordmark, the
 * headline, and the closing line inside the center 630px square some apps
 * crop to, with a glimpse of the Today list beside them. The image has to
 * stay under 300 KB, the limit the Social Previews rule sets. Run it with
 * node design/og-image/render.mts whenever the app's look or pitch changes,
 * and give a changed image a new filename, since apps cache previews.
 *
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const CAR_URL_STR = new URL( './card.html', import.meta.url ).href;                                   // What: Card URL String. Why: The card loads its fonts and styles by paths relative to itself. How: This is card.html's own file URL.
const MAX_BYT_NUM = 300 * 1024;                                                                       // What: Maximum Bytes Number. Why: The preview image stays under 300 KB, the limit the Social Previews rule sets. How: This is that limit in bytes.
const OUT_PAT_STR = fileURLToPath( new URL( '../../public/assets/og-image-3.png', import.meta.url ) ); // What: Output Path String. Why: The home page's tags point at the card in public/assets/. How: This resolves that path from the script's own location.

// #endregion Constants



// #region Module Init

const { broInsObj, capPagObj } = await opeCapFun( { height : 630, width : 1200 } ); // What: Browser Instance Object. Why: The image is drawn by a real browser. How: This is the Chromium the kit launched. // What: Capture Page Object. Why: The capture has to be exactly 1,200x630. How: This is a page opened at that size.


await capPagObj.goto( CAR_URL_STR ); // What: Card Load Call. Why: The capture starts from the card. How: This opens card.html.

await capPagObj.evaluate( () => document.fonts.ready ); // What: Fonts Ready Wait. Why: Text captured before its web font loads would be set in a fallback. How: This waits for the page's fonts.

await capPagObj.screenshot( { path : OUT_PAT_STR, type : 'png' } ); // What: Image Capture Call. Why: This writes the image. How: This saves the page as a PNG.

await broInsObj.close(); // What: Browser Close Call. Why: The script should exit once the image is saved. How: This shuts Chromium down.



if ( statSync( OUT_PAT_STR ).size >= MAX_BYT_NUM ) throw new Error( `${ OUT_PAT_STR } is at or over the ${ MAX_BYT_NUM.toLocaleString( 'en-US' ) } byte limit.` ); // What: Size Guard. Why: An image over the limit can go unshown in some apps. How: This fails the run when the saved image reaches it.



console.log( `Wrote ${ OUT_PAT_STR } (${ statSync( OUT_PAT_STR ).size.toLocaleString( 'en-US' ) } bytes).` ); // What: Result Log Call. Why: The run should say what it wrote. How: This prints the path and size.

// #endregion Module Init


