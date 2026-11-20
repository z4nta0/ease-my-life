


// #region Imports

import { fileURLToPath } from 'node:url';          // What: File URL To Path. Why: The paths are resolved from this script's own location. How: This turns a file URL into a path.
import { opeCapFun     } from '../render-kit.mts'; // What: Open Capture Function. Why: The icon's sizes are drawn in a real browser's canvas. How: This launches Chromium and opens a blank page.
import { readFileSync  } from 'node:fs';           // What: Read File Sync. Why: The mark is read from the app's own icon. How: This reads the SVG's bytes.
import { writeFileSync } from 'node:fs';           // What: Write File Sync. Why: The finished icon is saved into public/. How: This writes its bytes.

// #endregion Imports



/**
 * render.mts = Favicon Renderer
 *
 * @summary
 * Rebuilds public/favicon.ico from the app's own mark, public/assets/icon.svg,
 * packing a PNG at each size its head link names (16, 32, and 48px) into one
 * ICO file, since browsers request /favicon.ico on their own. The app's PNG
 * icons are already sized right and stay as they are. Run it with node
 * design/icons/render.mts whenever the mark changes.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ICO_SIZ_ARR = [ 16, 32, 48 ];                                                                     // What: ICO Size Array. Why: favicon.ico should hold the sizes its head link names. How: Each is rendered and packed in this order.
const OUT_PAT_STR = fileURLToPath( new URL( '../../public/favicon.ico', import.meta.url ) );           // What: Output Path String. Why: Browsers request the icon from the site's root. How: This resolves public/favicon.ico from the script's own location.
const SOU_SVG_STR = fileURLToPath( new URL( '../../public/assets/icon.svg', import.meta.url ) );       // What: Source SVG String. Why: The app's mark is the one artwork every icon is drawn from. How: This resolves the icon's path.

// #endregion Constants



// #region Module State

const SOU_B64_STR = readFileSync( SOU_SVG_STR ).toString( 'base64' ); // What: Source Base64 String. Why: The browser draws the mark from data rather than a file path. How: This reads the artwork and encodes it.

// #endregion Module State



// #region Module Init

const { broInsObj, capPagObj } = await opeCapFun(); // What: Browser Instance Object. Why: The icon is drawn in a real browser's canvas. How: This is the Chromium the kit launched. // What: Capture Page Object. Why: The canvas work runs inside a page, and each finished size is captured from it. How: This is a blank page at the default size.



// #region renPngFun

/**
 * renPngFun = Render PNG Function
 *
 * @summary
 * Draws the mark at one square size inside the browser and returns the PNG's
 * bytes. The mark is a vector, so the browser rasterizes it straight at the
 * target size.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param icoSizNum - Icon Size Number: The icon's width and height in pixels.
 *
 * @returns A promise that resolves with the finished PNG's bytes.
 *
 * @example
 * ```ts
 * renPngFun(32) // => the 32px icon's PNG bytes
 * ```
 *
*/

async function renPngFun ( icoSizNum : number ) : Promise< Buffer > {


	const pngB64Str = await capPagObj.evaluate( async ( [ souB64Str, tarSizNum ] ) => { // What: PNG Base64 String. Why: The canvas lives in the page, so the finished image comes back as text. How: This runs the drawing in the page and returns the PNG as base64.


		// #region Source Image Loading

		const souImaEle = new Image(); // What: Source Image Element. Why: The mark has to be decoded before it's drawn. How: This loads it from its base64 data.


		souImaEle.src = `data:image/svg+xml;base64,${ souB64Str }`; // What: Source Address Assignment. Why: The image loads from the data handed in. How: This sets it as an SVG data URL.


		await souImaEle.decode(); // What: Source Decode Wait. Why: Drawing an undecoded image draws nothing. How: This waits until it's ready.

		// #endregion Source Image Loading



		// #region Final Canvas Drawing

		const finCanEle = document.createElement( 'canvas' ); // What: Final Canvas Element. Why: The icon draws at its exact target size. How: This creates the canvas.


		finCanEle.height = tarSizNum; // What: Final Height Assignment. Why: The icon is square at its target size. How: This sets the height.
		finCanEle.width  = tarSizNum; // What: Final Width Assignment. Why: The icon is square at its target size. How: This sets the width.


		finCanEle.getContext( '2d' )!.drawImage( souImaEle, 0, 0, tarSizNum, tarSizNum ); // What: Mark Draw Call. Why: This draws the icon itself. How: This rasterizes the mark to fill the square. // What: Non-Null Note. Why: getContext can return null for an unknown context type, and '2d' is always supported. How: The assertion lets drawImage run on it.

		// #endregion Final Canvas Drawing



		return finCanEle.toDataURL( 'image/png' ).split( ',' )[ 1 ]; // What: PNG Data Return. Why: The bytes have to leave the page as text. How: This encodes the canvas as a PNG and returns its base64 part.


	}, [ SOU_B64_STR, icoSizNum ] as const ); // What: Drawing Arguments. Why: The page can't read this script's variables. How: This hands the mark's data and the target size into the page. // What: Type Assertion Note. Why: The tuple keeps each argument's own type inside the page function. How: as const types the array as a fixed pair.



	return Buffer.from( pngB64Str, 'base64' ); // What: PNG Bytes Return. Why: The caller writes bytes, not text. How: This decodes the base64 PNG into a buffer.


}

// #endregion renPngFun



const icoPngArr = await Promise.all( ICO_SIZ_ARR.map( ( icoSizNum ) => renPngFun( icoSizNum ) ) ); // What: ICO PNG Array. Why: favicon.ico packs one PNG per size. How: This renders each of its sizes.
const icoHeaObj = Buffer.alloc( 6 + 16 * icoPngArr.length );                                      // What: ICO Header Object. Why: An ICO file starts with a header and one directory entry per image. How: This allocates both, zero-filled.


icoHeaObj.writeUInt16LE( 1, 2 );                // What: ICO Type Write. Why: The format marks icons with type 1. How: This writes it after the reserved zero.
icoHeaObj.writeUInt16LE( icoPngArr.length, 4 ); // What: ICO Count Write. Why: The header says how many images follow. How: This writes the count.


let icoOffNum = icoHeaObj.length; // What: ICO Offset Number. Why: Each directory entry says where its image starts. How: This begins right after the header and directory.


for ( const [ icoIndNum, icoPngObj ] of icoPngArr.entries() ) { // What: ICO Entry Loop. Why: Each image needs a directory entry. How: This writes one per size, in order.


	const entOffNum = 6 + 16 * icoIndNum;       // What: Entry Offset Number. Why: Each entry has its own place in the directory. How: This finds it.
	const entSizNum = ICO_SIZ_ARR[ icoIndNum ]; // What: Entry Size Number. Why: The entry names its image's width and height. How: This reads the size it was rendered at.


	icoHeaObj.writeUInt8( entSizNum, entOffNum );     // What: Entry Width Write. Why: The entry names the image's width. How: This writes it.
	icoHeaObj.writeUInt8( entSizNum, entOffNum + 1 ); // What: Entry Height Write. Why: The entry names the image's height. How: This writes it.

	icoHeaObj.writeUInt16LE( 1, entOffNum + 4 );  // What: Entry Planes Write. Why: The format expects one color plane. How: This writes it.
	icoHeaObj.writeUInt16LE( 32, entOffNum + 6 ); // What: Entry Depth Write. Why: The images are full-color PNGs with alpha. How: This writes 32 bits per pixel.

	icoHeaObj.writeUInt32LE( icoPngObj.length, entOffNum + 8 ); // What: Entry Size Write. Why: The entry says how many bytes its image takes. How: This writes the PNG's length.
	icoHeaObj.writeUInt32LE( icoOffNum, entOffNum + 12 );       // What: Entry Offset Write. Why: The entry says where its image starts. How: This writes the running offset.


	icoOffNum += icoPngObj.length; // What: Offset Advance. Why: The next image starts after this one. How: This adds its length.


}



writeFileSync( OUT_PAT_STR, Buffer.concat( [ icoHeaObj, ...icoPngArr ] ) ); // What: ICO Write Call. Why: Browsers request /favicon.ico on their own. How: This writes the header, directory, and PNGs as one file.

await broInsObj.close(); // What: Browser Close Call. Why: The script should exit once the icon is saved. How: This shuts Chromium down.

console.log( `Wrote ${ OUT_PAT_STR } with ${ ICO_SIZ_ARR.join( ', ' ) }px images.` ); // What: Result Log Call. Why: The run should say what it wrote. How: This prints the path and sizes.

// #endregion Module Init


