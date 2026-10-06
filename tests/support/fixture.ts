


// #region Imports

import { fileURLToPath } from 'node:url';  // What: File URL To Path. Why: The default folder is found relative to this file. How: This turns import.meta.url into a path.
import { readdirSync   } from 'node:fs';   // What: Read Directory Sync. Why: With no path given, the newest backup in the test data folder is used. How: This lists that folder's files.
import { readFileSync  } from 'node:fs';   // What: Read File Sync. Why: The backup is read from disk before any page opens. How: This reads its JSON text.
import { resolve       } from 'node:path'; // What: Resolve. Why: The default folder sits beside the repo, not inside it. How: This builds its absolute path.
import { statSync      } from 'node:fs';   // What: Stat Sync. Why: The newest backup is chosen by modification time. How: This reads each file's mtime.


import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: A backup file holds the app's whole saved state. How: This types what reaFixFun returns.

// #endregion Imports



/**
 * fixture.ts = Fixture
 *
 * @summary
 * Finds and reads the real-data backup the simulation runs on. The backup is
 * personal data, so it never enters the repo: it's read from the path in the
 * EML_TEST_FIXTURE environment variable, or else from the newest .json file
 * in an ease-my-life-testdata folder sitting next to the repo. A missing file
 * fails with a message saying where it was looked for, rather than letting a
 * test run on nothing.
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

const DAT_DIR_STR = resolve( fileURLToPath( new URL( '../../..', import.meta.url ) ), 'ease-my-life-testdata' ); // What: Data Directory String. Why: The real data lives beside the repo so it can't be committed by accident. How: This resolves the ease-my-life-testdata folder next to the repo.

// #endregion Constants



// #region Helpers

// #region fixPatFun

/**
 * fixPatFun = Fixture Path Function
 *
 * @summary
 * Returns the backup file to run on. EML_TEST_FIXTURE wins when set, so a
 * run can pin an exact file; otherwise the newest .json file in the test
 * data folder is used, so dropping in a fresh export is all it takes to test
 * against current data. Throws when neither yields a file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The absolute path of the backup file.
 *
 * @example
 * ```ts
 * fixPatFun() // => '/home/me/projects/ease-my-life-testdata/backup.json'
 * ```
 *
*/

const fixPatFun = () : string => { // What: Fixture Path Function. Why: The tests need one backup file to run on. How: This returns the environment's path or the newest file in the data folder.


	const envPatStr = process.env.EML_TEST_FIXTURE; // What: Environment Path String. Why: A run can pin an exact backup. How: This reads EML_TEST_FIXTURE.



	if ( envPatStr ) return resolve( envPatStr ); // What: Environment Path Return. Why: An explicit path always wins. How: This returns it resolved.



	let datNamArr : string[] = []; // What: Data Name Array. Why: The folder may not exist on a machine without test data. How: This starts empty and is filled when the folder can be read.



	try { datNamArr = readdirSync( DAT_DIR_STR ).filter( ( filNamStr ) => filNamStr.endsWith( '.json' ) ); } // What: Folder Read Attempt. Why: Only .json files are exports. How: This lists the data folder and keeps its .json names.

	catch { throw new Error( `No backup found: set EML_TEST_FIXTURE or add a .json export to ${ DAT_DIR_STR }` ); } // What: Missing Folder Catch. Why: A machine without the data folder can't run the simulation. How: This throws with where to put an export.



	const newNamArr = datNamArr.sort( ( namOneStr, namTwoStr ) => statSync( resolve( DAT_DIR_STR, namTwoStr ) ).mtimeMs - statSync( resolve( DAT_DIR_STR, namOneStr ) ).mtimeMs ); // What: Newest Name Array. Why: The most recent export reflects the current data. How: This sorts the names by modification time, newest first.



	if ( !newNamArr.length ) throw new Error( `No backup found: set EML_TEST_FIXTURE or add a .json export to ${ DAT_DIR_STR }` ); // What: Empty Folder Guard. Why: A folder without exports can't be run on. How: This throws with where to put one.



	return resolve( DAT_DIR_STR, newNamArr[ 0 ] ); // What: Newest Path Return. Why: The newest export is the default. How: This returns its full path.


};

// #endregion fixPatFun



// #region reaFixFun

/**
 * reaFixFun = Read Fixture Function
 *
 * @summary
 * Reads and parses the backup fixPatFun finds. The result is the app's raw
 * saved state, exactly as Settings exports it, pick log included, ready to
 * be written into a test page's IndexedDB.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The parsed backup.
 *
 * @example
 * ```ts
 * reaFixFun() // => saved state from the backup
 * ```
 *
*/

const reaFixFun = () : StaAppTyp => JSON.parse( readFileSync( fixPatFun(), 'utf8' ) ); // What: Read Fixture Function. Why: The simulation starts from real data. How: This parses the backup fixPatFun finds.

// #endregion reaFixFun

// #endregion Helpers



// #region Exports

export { fixPatFun, reaFixFun }; // What: Named Exports. Why: The suites load the real-data backup through these. How: This exports fixPatFun and reaFixFun by name.

// #endregion Exports


