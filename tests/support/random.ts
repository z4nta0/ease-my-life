


// #region Imports

import type { Page } from '@playwright/test'; // What: Page. Why: The seeding installs itself on a Playwright page. How: This types insSeeFun's page parameter.

// #endregion Imports



/**
 * random.ts = Random
 *
 * @summary
 * Makes the app's own scheduling decisions repeatable. The picker, cadence,
 * conditional, and id code in src/core/ and src/state/ draws from
 * Math.random, but so do the background flourish, the celebration
 * particles, and the regeneration loader, whose draws depend on layout and
 * animation timing. Seeding Math.random as a whole would let one extra
 * flourish draw shift every pick after it, so this splits the stream by
 * caller instead: a draw made from a src/core/ or src/state/ module comes
 * from a seeded generator, and every other draw stays native. Two runs with
 * the same seed and the same clock then make the same picks, which is what
 * lets a simulation on one branch be compared against another. Each page
 * load restarts the generator from the seed mixed with a count of the tab's
 * loads, so no load replays another's draws or ids. It relies on the dev
 * server, whose stack traces keep each module's source path.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region insSeeFun

/**
 * insSeeFun = Install Seed Function
 *
 * @summary
 * Installs the split random stream on a page before any of the app's code
 * runs, so every load of the page starts the seeded generator from a point
 * set by the seed and by how many loads the tab has made before it. The
 * load count keeps a reload from replaying the draws and ids of an earlier
 * load, and it repeats exactly from run to run. The faked clock can't stand
 * in for it: inside an init script, Date.now() still reads the time the
 * clock was installed at, whatever day the suite has moved it to since. The
 * generator is mulberry32, a small, fast generator that gives
 * the same sequence for the same 32-bit seed in every browser. A draw is
 * routed to it when the calling stack passes through /src/core/ or
 * /src/state/, the folders holding every scheduling decision; everything
 * else keeps the browser's own Math.random.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to install the seeding on.
 * @param seeValNum - Seed Value Number: The 32-bit seed for the generator.
 *
 * @returns A promise that settles once the script is registered.
 *
 * @example
 * ```ts
 * await insSeeFun(curPagObj, 20261004) // => void
 * ```
 *
*/

const insSeeFun = async ( curPagObj : Page, seeValNum : number ) : Promise< void > => { // What: Install Seed Function. Why: Repeatable runs need the app's scheduling draws seeded. How: This registers an init script that replaces Math.random with the split stream.


	await curPagObj.addInitScript( ( iniSeeNum : number ) => { // What: Seed Init Script. Why: The replacement must exist before the app's first module runs. How: Playwright runs this in the page on every load, before the page's own scripts.


		let loaCouNum = 0; // What: Load Count Number. Why: Two loads on the same day must not start the generator at the same point. How: This starts at zero and is read from the tab's session storage below.



		try { // What: Load Count Read. Why: The count has to survive reloads, which session storage does. How: This reads the tab's count and stores it raised by one.


			loaCouNum = Number( sessionStorage.getItem( '__emlSeeLoa' ) ) || 0; // What: Load Count Read Call. Why: Earlier loads in this tab set it. How: This reads it, or zero on the first load.
			sessionStorage.setItem( '__emlSeeLoa', String( loaCouNum + 1 ) );   // What: Load Count Write Call. Why: The next load must see a higher count. How: This stores the raised count.


		}

		catch { loaCouNum = 0; } // What: Load Count Fallback. Why: A blank page has no session storage. How: This keeps the count at zero there.



		let genStaNum = ( iniSeeNum ^ Math.imul( loaCouNum + 1, 2654435761 ) ) >>> 0; // What: Generator State Number. Why: mulberry32 advances one 32-bit state per draw, and no load may replay another's draws. How: This starts at the seed mixed with the load count, read as an unsigned 32-bit integer.

		const natRanFun = Math.random.bind( Math ); // What: Native Random Function. Why: Draws from anywhere else must keep the browser's own randomness. How: This keeps the original Math.random.
		const schPatObj = /\/src\/(core|state)\//;  // What: Scheduling Pattern Object. Why: Every scheduling decision lives in these two folders. How: This regex matches a stack frame from either one.



		const mulRanFun = () => { // What: Mulberry Random Function. Why: The seeded draws need a generator that repeats exactly for the same seed. How: This is mulberry32, returning a float in [0, 1).


			genStaNum = ( genStaNum + 0x6D2B79F5 ) >>> 0;                                          // What: State Advance. Why: Each draw moves the generator to its next state. How: This adds mulberry32's increment, kept as an unsigned 32-bit integer.
			let mixValNum = genStaNum;                                                             // What: Mix Value Number. Why: The output is scrambled from the state without changing it. How: This copies the state to mix.
			mixValNum = Math.imul( mixValNum ^ ( mixValNum >>> 15 ), mixValNum | 1 );              // What: First Mix. Why: mulberry32 spreads the state's bits before output. How: This is its first xor-shift multiply.
			mixValNum ^= mixValNum + Math.imul( mixValNum ^ ( mixValNum >>> 7 ), mixValNum | 61 ); // What: Second Mix. Why: A second round removes the patterns the first leaves. How: This is mulberry32's second xor-shift multiply.



			return ( ( mixValNum ^ ( mixValNum >>> 14 ) ) >>> 0 ) / 4294967296; // What: Seeded Draw Return. Why: Math.random's callers expect a float in [0, 1). How: This finishes the mix and divides by 2 to the 32nd.


		};



		Math.random = () => ( schPatObj.test( new Error().stack || '' ) ? mulRanFun() : natRanFun() ); // What: Math Random Replacement. Why: Only scheduling draws should be seeded. How: This reads the calling stack and routes a draw from src/core/ or src/state/ to the seeded generator, any other to the native one.


	}, seeValNum ); // What: Seed Argument. Why: The init script runs inside the page and can't see this file's variables. How: This passes the seed in as the script's argument.


};

// #endregion insSeeFun

// #endregion Helpers



// #region Exports

export { insSeeFun }; // What: Named Exports. Why: The simulation seeds its pages through this. How: This exports insSeeFun by name.

// #endregion Exports


