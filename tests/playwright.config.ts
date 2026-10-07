


// #region Imports

import { defineConfig  } from '@playwright/test';   // What: Define Config. Why: Playwright's config helper passes the config through with its types. How: This wraps the exported config object.
import { fileURLToPath } from 'node:url';           // What: File URL To Path. Why: The dev server has to start from the repo root, one folder above this file. How: This turns that folder's URL into a path for webServer.cwd.
import { TIM_ZON_STR   } from './support/clock.ts'; // What: Time Zone String. Why: The pages and the clock helpers must agree on the timezone. How: This sets every page's timezoneId.

// #endregion Imports



/**
 * playwright.config.ts = Playwright Config
 *
 * @summary
 * The config behind npm test and its four suites, each a Playwright project
 * run against the real app: simulation (a faked-clock run through weeks of
 * days on a copy of real data), interaction (every control, editor, and
 * animation), onboarding (every tour and Replay), and responsive (layout at
 * phone to desktop widths). Playwright starts the Vite dev server on port
 * 5190 for the run and stops it afterwards, so a dev server already running
 * on the usual 5173 is never touched. Every page runs in Chicago time with
 * service workers blocked, so dates and caching match from run to run, and
 * reports, screenshots, and simulation traces land in tests/output, which git
 * ignores.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ROO_DIR_STR = fileURLToPath( new URL( '..', import.meta.url ) ); // What: Root Directory String. Why: The dev server must run from the repo root, where vite.config.ts lives. How: This resolves the folder above tests/.
const SER_URL_STR = 'http://localhost:5190';                           // What: Server URL String. Why: Every suite opens the app from the same dev server. How: This is the address Playwright waits on and every page's baseURL.



const PLA_CON_OBJ = defineConfig({ // What: Playwright Config Object. Why: Playwright reads its whole setup from this file's default export. How: This holds the shared page settings, the four suite projects, the reporters, and the dev server.


	expect        : { timeout : 10000 }, // What: Expect. Why: Some assertions wait on animations and debounced saves. How: This gives each expect up to 10 seconds.
	fullyParallel : false,               // What: Fully Parallel. Why: Each spec file walks one flow in order, step after step. How: This keeps a file's tests running in sequence, while separate files may still run in parallel.
	outputDir     : 'output/results',    // What: Output Directory. Why: Failure screenshots and traces need a home git ignores. How: This writes them under tests/output/results.
	testDir       : '.',                 // What: Test Directory. Why: Each project picks its own folder below. How: This roots test discovery at tests/.
	workers       : 4,                   // What: Workers. Why: The interaction and responsive files are independent, but every worker drives a full browser. How: This runs up to four spec files at once.

	projects : [ // What: Projects. Why: Each suite runs on its own, and the simulation needs far more time than the rest. How: This lists one project per suite folder, each runnable with --project.


		{ name : 'interaction', testMatch : 'interaction/**/*.spec.ts', timeout : 300000  }, // What: Interaction Project. Why: Every control and editor is driven against IndexedDB. How: This runs tests/interaction with five minutes per test.
		{ name : 'onboarding',  testMatch : 'onboarding/**/*.spec.ts',  timeout : 600000  }, // What: Onboarding Project. Why: Each tour is walked step by step at three widths. How: This runs tests/onboarding with ten minutes per test.
		{ name : 'responsive',  testMatch : 'responsive/**/*.spec.ts',  timeout : 600000  }, // What: Responsive Project. Why: Every page is measured at several widths. How: This runs tests/responsive with ten minutes per test.
		{ name : 'simulation',  testMatch : 'simulation/**/*.spec.ts',  timeout : 7200000 }  // What: Simulation Project. Why: Weeks of simulated days take a long time on real data. How: This runs tests/simulation with two hours per test.


	],

	reporter : [ // What: Reporter. Why: A run needs a live summary in the terminal and a browsable report afterwards. How: This prints a line per test and writes an HTML report to tests/output/report.


		[ 'list' ],                                                    // What: List Reporter. Why: The terminal shows each test as it finishes. How: This is Playwright's list reporter.
		[ 'html', { open : 'never', outputFolder : 'output/report' } ] // What: Html Reporter. Why: A failure is easier to read with its screenshot and trace. How: This writes the report to tests/output/report without opening a browser.


	],

	use : { // What: Use. Why: Every suite shares the same page setup. How: This sets the base URL, timezone, locale, service worker blocking, and failure artifacts.


		baseURL        : SER_URL_STR,         // What: Base URL. Why: Specs navigate with short paths. How: This points every page.goto at the dev server.
		locale         : 'en-US',             // What: Locale. Why: Date labels and number formats must match from run to run. How: This runs every page in US English.
		screenshot     : 'only-on-failure',   // What: Screenshot. Why: A failing step is easier to diagnose from what was on screen. How: This saves a screenshot only when a test fails.
		serviceWorkers : 'block',             // What: Service Workers. Why: The PWA worker could serve cached files instead of the code under test. How: This blocks service worker registration.
		timezoneId     : TIM_ZON_STR,         // What: Timezone Identifier. Why: Day boundaries decide every simulated day, and the real data was made in this timezone. How: This runs every page in the clock helpers' Chicago timezone.
		trace          : 'retain-on-failure'  // What: Trace. Why: A failure can be stepped through afterwards. How: This keeps the Playwright trace only for failing tests.


	},

	webServer : { // What: Web Server. Why: The suites need the app running, without touching any dev server already open. How: This starts Vite on its own strict port from the repo root and stops it when the run ends.


		command             : 'npx vite --port 5190 --strictPort', // What: Command. Why: A strict port fails loudly instead of drifting onto another server's port. How: This starts the Vite dev server on 5190.
		cwd                 : ROO_DIR_STR,                         // What: Current Working Directory. Why: Vite reads its config from the repo root. How: This starts the command there.
		reuseExistingServer : false,                               // What: Reuse Existing Server. Why: A leftover server could be running other code. How: This always starts a fresh one.
		timeout             : 60000,                               // What: Timeout. Why: The first start can take a while on a cold cache. How: This waits up to a minute for the server to answer.
		url                 : SER_URL_STR                          // What: URL. Why: Playwright starts the tests only once the app answers. How: This is the address it polls.


	}


});

// #endregion Constants



// #region Exports

export default PLA_CON_OBJ; // What: Default Export. Why: Playwright reads its config from this file's default export. How: This exports PLA_CON_OBJ.

// #endregion Exports


