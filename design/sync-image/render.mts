


// #region Imports

import { fileURLToPath } from 'node:url';          // What: File URL To Path. Why: The PNG lands beside this file. How: This turns its URL into a path.
import { renCarFun     } from '../render-kit.mts'; // What: Render Card Function. Why: The square product cards are captured the same way. How: This serves, opens, and screenshots the card, then closes everything and logs the size.

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
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const OUT_PAT_STR = fileURLToPath( new URL( './sync-image.png', import.meta.url ) ); // What: Output Path String. Why: The PNG is uploaded to Polar by hand. How: This resolves sync-image.png beside this script.

// #endregion Constants



// #region Module Init

await renCarFun( 'design/sync-image', OUT_PAT_STR ); // What: Card Render Call. Why: This is the whole render. How: This captures the card in this folder to OUT_PAT_STR.

// #endregion Module Init


