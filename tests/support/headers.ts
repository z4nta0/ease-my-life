


// #region Imports

import { fileURLToPath } from 'node:url'; // What: File URL To Path. Why: The headers files sit in public/ and dist/ at the repo root, two folders above this one. How: This turns each file's URL into a path to read.
import { readFileSync  } from 'node:fs';  // What: Read File Sync. Why: The headers are read from Netlify's headers files. How: This reads a headers file as text.

// #endregion Imports



/**
 * headers.ts = Headers
 *
 * @summary
 * Reads the headers the app sends from Netlify's headers files, so the
 * security and SEO checks test the real policy rather than a copy of it. The
 * policy itself is written in public/_headers, and the build copies that file
 * to dist/_headers, the copy Netlify applies once deployed. Neither the dev
 * server nor vite preview reads either file, so this reader is the only way
 * the tests get their headers.
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

const BUI_HEA_STR = fileURLToPath( new URL( '../../dist/_headers', import.meta.url ) );   // What: Built Headers String. Why: Netlify applies the built copy. How: This resolves dist/_headers from this file's own address.
const HEA_PAT_STR = fileURLToPath( new URL( '../../public/_headers', import.meta.url ) ); // What: Headers Path String. Why: The policy is written in the source file. How: This resolves public/_headers from this file's own address.

// #endregion Constants



// #region Helpers

type HeaBloTyp = { heaObj : Record< string, string >, patStr : string }; // What: Header Block Type. Why: A headers file is a list of paths, each with its own headers. How: This pairs a block's path with its headers, keyed by lowercase name.

// #region heaBloFun

/**
 * heaBloFun = Header Block Function
 *
 * @summary
 * Reads a headers file into its blocks, in the file's order. Netlify's
 * format puts each path on a line of its own and indents that path's headers
 * below it, one Name: value pair per line, with # lines as comments, so this
 * starts a block at each unindented line that isn't a comment and adds each
 * indented Name: value line to the block above it, keyed by lowercase name,
 * the way Playwright reports response headers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param filPatStr - File Path String: The headers file to read.
 *
 * @returns The file's blocks, each a path and its headers.
 * @see {@link heaBloArr}
 *
 * @example
 * ```ts
 * heaBloFun(HEA_PAT_STR) // => [ { heaObj : { ... }, patStr : '/*' } ]
 * ```
 *
*/

function heaBloFun ( filPatStr : string ) : HeaBloTyp[] {


	const heaBloArr : HeaBloTyp[] = []; // What: Header Block Array. Why: Each path's headers are kept apart. How: This collects one block per path line.


	for ( const linTexStr of readFileSync( filPatStr, 'utf8' ).split( '\n' ) ) { // What: Line Loop. Why: The file is read line by line. How: This walks every line of the file.


		if ( /^[^\s#]/.test( linTexStr ) ) { heaBloArr.push( { heaObj : {}, patStr : linTexStr.trim() } ); continue; } // What: Path Line Guard. Why: An unindented line that isn't a comment names the path the lines below it apply to. How: This starts a new block for it and moves on.



		const heaMatArr = linTexStr.match( /^\s+([^:#\s][^:]*):\s*(.*)$/ ); // What: Header Match Array. Why: Only an indented Name: value line is a header. How: This captures the name and value, or gives null for anything else.


		if ( heaMatArr && heaBloArr.length > 0 ) heaBloArr[ heaBloArr.length - 1 ].heaObj[ heaMatArr[ 1 ].trim().toLowerCase() ] = heaMatArr[ 2 ].trim(); // What: Header Store Check. Why: A header belongs to the path above it. How: This stores the header's value under its lowercase name in the last block.


	}



	return heaBloArr; // What: Header Block Return. Why: The callers pick the blocks they need. How: This hands back every block read.


}

// #endregion heaBloFun



// #region heaAllFun

/**
 * heaAllFun = Headers All Function
 *
 * @summary
 * Returns the headers public/_headers sends with every path, its /* block,
 * keyed by lowercase header name, or an empty object when the file has no
 * such block, so a policy check fails on the missing header rather than
 * throwing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The /* block's headers, keyed by lowercase name.
 *
 * @example
 * ```ts
 * heaAllFun() // => { 'x-frame-options' : 'DENY', ... }
 * ```
 *
*/

function heaAllFun () : Record< string, string > {


	return heaBloFun( HEA_PAT_STR ).find( ( heaBloObj ) => heaBloObj.patStr === '/*' )?.heaObj ?? {}; // What: All Paths Headers Return. Why: The policy checks read the headers every page gets. How: This finds the /* block and hands back its headers, or an empty object without one.


}

// #endregion heaAllFun



// #region heaPatFun

/**
 * heaPatFun = Headers Path Function
 *
 * @summary
 * Returns every header the built dist/_headers sends with one path, keyed by
 * lowercase name, merged from each block whose path matches it in the file's
 * order: a path ending in * matches every path that starts with what comes
 * before it, and any other path matches only itself. It reads the build, so it
 * expects npm run build to have run first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param reqPatStr - Request Path String: The address's path, without its
 *                    query, such as /contact.
 *
 * @returns The headers sent with the path, keyed by lowercase name.
 *
 * @example
 * ```ts
 * heaPatFun('/contact') // => { 'x-frame-options' : 'DENY', ... }
 * ```
 *
*/

function heaPatFun ( reqPatStr : string ) : Record< string, string > {


	return Object.assign( {}, ...heaBloFun( BUI_HEA_STR ).filter( ( heaBloObj ) => heaBloObj.patStr.endsWith( '*' ) ? reqPatStr.startsWith( heaBloObj.patStr.slice( 0, -1 ) ) : reqPatStr === heaBloObj.patStr ).map( ( heaBloObj ) => heaBloObj.heaObj ) ); // What: Path Headers Return. Why: A path gets the headers of every block that matches it. How: This keeps the matching blocks and merges their headers in the file's order.


}

// #endregion heaPatFun

// #endregion Helpers



// #region Exports

export { heaAllFun, heaPatFun }; // What: Named Exports. Why: The headers file's policy and each path's headers are read from one place. How: This exports the reader for the /* block and the one for a single path.

// #endregion Exports


