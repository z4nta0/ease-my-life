


// #region Imports

import { defineConfig } from '@playwright/test';     // What: Define Config. Why: Playwright's config helper passes the config through with its types. How: This wraps the exported config object.
import { PRE_URL_STR  } from './support/servers.ts'; // What: Preview URL String. Why: The security suite loads the production build, since the dev server injects inline scripts the security policy would block. How: This is the security projects' baseURL and the address Playwright waits on for the preview server.
import { ROO_DIR_STR  } from './support/servers.ts'; // What: Root Directory String. Why: Both servers must run from the repo root, where vite.config.ts lives. How: This is each server's cwd.
import { TIM_ZON_STR  } from './support/clock.ts';   // What: Time Zone String. Why: The pages and the clock helpers must agree on the timezone. How: This sets every page's timezoneId.
import { TIP_URL_STR  } from './support/app.ts';     // What: Tip URL String. Why: The app needs a tip page address to enable its Buy Me a Coffee button. How: This becomes the test server's VITE_TIP_URL.

// #endregion Imports



/**
 * playwright.config.ts = Playwright Config
 *
 * @summary
 * The config behind npm test and its ten suites, each one or more Playwright
 * projects: simulation (a faked-clock run through weeks of days on a copy of
 * real data), accessibility (the pre-commit scan, one project per engine),
 * account (two devices signing in and syncing against the Firebase Emulator,
 * one project per engine), interaction (every control, editor, and animation),
 * onboarding (every tour and Replay), responsive (layout at phone to desktop
 * widths), rules (the Firestore security rules, in the local emulator),
 * security (the security policy, the build, and the dependencies, one project
 * per engine), SEO (each page's head, the crawler files, and the link
 * preview, one project per engine), and sync (the sync engine in Node,
 * against a fake cloud copy). All but rules and sync run against the real app
 * in a browser. Playwright starts the Vite dev server on port 5190 for the
 * run, and a build served by vite preview on 5191 for checks of what ships,
 * and stops both afterwards, so a dev server already running on the usual
 * 5173 is never touched. Every page runs in Chicago time with service workers
 * blocked, so dates and caching match from run to run, and reports,
 * screenshots, and simulation traces land in tests/output, which git ignores.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ENG_NAM_ARR = [ // What: Engine Name Array. Why: The accessibility, account, security, and SEO suites run in all three engines. How: Each entry is a Playwright browser name, given one project apiece in each of those suites.


	'chromium', // What: Chromium Engine. Why: Chrome and Edge render with it. How: This is Playwright's Chromium build.
	'firefox',  // What: Firefox Engine. Why: Firefox renders with its own engine, Gecko. How: This is Playwright's Firefox build.
	'webkit'    // What: WebKit Engine. Why: Safari, and every browser on iOS, renders with it. How: This is Playwright's WebKit build.


] as const;



const SER_URL_STR = 'http://localhost:5190'; // What: Server URL String. Why: Every suite but security opens the app from the dev server. How: This is the address Playwright waits on and the baseURL of every project but the security ones.



const PLA_CON_OBJ = defineConfig({ // What: Playwright Config Object. Why: Playwright reads its whole setup from this file's default export. How: This holds the shared page settings, the eight suites' projects, the reporters, and the dev server.


	expect        : { timeout : 10000 }, // What: Expect. Why: Some assertions wait on animations and debounced saves. How: This gives each expect up to 10 seconds.
	fullyParallel : false,               // What: Fully Parallel. Why: Each spec file walks one flow in order, step after step. How: This keeps a file's tests running in sequence, while separate files may still run in parallel.
	outputDir     : 'output/results',    // What: Output Directory. Why: Failure screenshots and traces need a home git ignores. How: This writes them under tests/output/results.
	testDir       : '.',                 // What: Test Directory. Why: Each project picks its own folder below. How: This roots test discovery at tests/.
	workers       : 6,                   // What: Workers. Why: Most spec files and the parallel specs' tests are independent, but every worker drives a full browser, and six held steady on a 24-core, 31 GB machine (measured 2026-11-13 in tech-geek-cards). How: This runs up to six tests at once.

	projects : [ // What: Projects. Why: Each suite runs on its own, and the simulation needs far more time than the rest. How: This lists one project per suite folder, each runnable with --project.


		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Accessibility Projects. Why: The pre-commit accessibility scan runs in every engine, since a check that passes in one proves nothing about the others. How: This adds one accessibility project per engine.


			name      : `accessibility-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'accessibility/**/*.spec.ts',   // What: Test Match. Why: The scan's specs live in their own folder. How: This runs every spec in tests/accessibility.
			timeout   : 300000,                         // What: Timeout. Why: The keyboard walk visits every stop of a full real-data tab. How: This gives each test five minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names that engine's Playwright browser.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium's default headless shell sometimes loses track of a tab a click opens, while the full headless mode doesn't. How: This runs Chromium as full headless Chrome.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Account Projects. Why: Signing in and syncing between two devices runs in every engine, against the Firebase Emulator that test:account starts around it. How: This adds one account project per engine.


			name      : `account-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'account/**/*.spec.ts',   // What: Test Match. Why: The account specs live in their own folder. How: This runs every spec in tests/account.
			timeout   : 120000,                   // What: Timeout. Why: Two devices sign in and sync on real data. How: This gives each test two minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names that engine's Playwright browser.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Security Projects. Why: The app has to work under its own security policy in every engine. How: This adds one security project per engine, each loading the production build.


			name      : `security-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'security/**/*.spec.ts',   // What: Test Match. Why: The security specs live in their own folder. How: This runs every spec in tests/security.
			timeout   : 120000,                    // What: Timeout. Why: Each state loads the real-data backup under the policy. How: This gives each test two minutes.

			use : { // What: Use. Why: The project has to launch its own engine and load what ships. How: This sets the browser it runs in, which build of it, and the preview server as its baseURL.


				baseURL     : PRE_URL_STR,                                      // What: Base URL. Why: The policy runs only on the production build. How: This points the project's page.goto at the preview server.
				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names that engine's Playwright browser.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: SEO Projects. Why: Each page's head, the crawler files, and the social preview card are checked in every engine. How: This adds one SEO project per engine.


			name      : `seo-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'seo/**/*.spec.ts',   // What: Test Match. Why: The SEO specs live in their own folder. How: This runs every spec in tests/seo.
			timeout   : 120000,               // What: Timeout. Why: Each state loads the real-data backup. How: This gives each test two minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names that engine's Playwright browser.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Interaction Projects. Why: Every control and editor is driven against IndexedDB in every engine, since a check that passes in one engine proves nothing about the others. How: This builds one project per engine from ENG_NAM_ARR.


			name      : `interaction-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'interaction/**/*.spec.ts',   // What: Test Match. Why: The interaction specs live in their own folder. How: This runs every spec in tests/interaction.
			timeout   : 300000,    // What: Timeout. Why: Each test walks a flow on real data. How: This gives each test five minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names it.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Onboarding Projects. Why: Each tour is walked step by step in every engine. How: This builds one project per engine from ENG_NAM_ARR.


			name      : `onboarding-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'onboarding/**/*.spec.ts',   // What: Test Match. Why: The onboarding specs live in their own folder. How: This runs every spec in tests/onboarding.
			timeout   : 600000,     // What: Timeout. Why: A whole tour runs at several widths. How: This gives each test ten minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names it.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		...ENG_NAM_ARR.map( ( engNamStr ) => ({ // What: Responsive Projects. Why: Every page is measured at several widths in every engine, since layout differs between them. How: This builds one project per engine from ENG_NAM_ARR.


			name      : `responsive-${ engNamStr }`, // What: Name. Why: A failure has to say which engine it came from. How: This names the project after it.
			testMatch : 'responsive/**/*.spec.ts',   // What: Test Match. Why: The responsive specs live in their own folder. How: This runs every spec in tests/responsive.
			timeout   : 600000,     // What: Timeout. Why: Every tab is measured at several widths. How: This gives each test ten minutes.

			use : { // What: Use. Why: The project has to launch its own engine. How: This sets the browser it runs in, and which build of it.


				browserName : engNamStr,                                        // What: Browser Name. Why: Each project runs in one engine. How: This names it.
				channel     : engNamStr === 'chromium' ? 'chromium' : undefined // What: Channel. Why: Chromium runs as full headless Chrome, as every project does. How: This picks it for Chromium only.


			}


		})),

		{ name : 'rules',       testMatch : 'rules/**/*.spec.ts',       timeout : 60000   }, // What: Rules Project. Why: The Firestore security rules are checked in the local emulator, which test:rules starts around it. How: This runs tests/rules with a minute per test.
		{ name : 'simulation',  testMatch : 'simulation/**/*.spec.ts',  timeout : 7200000 }, // What: Simulation Project. Why: Weeks of simulated days take a long time on real data, and they check the scheduling rules the app computes rather than how a page renders, so they run in Chromium only. How: This runs tests/simulation with two hours per test, in Playwright's default Chromium.
		{ name : 'sync',        testMatch : 'sync/**/*.spec.ts',        timeout : 60000   }  // What: Sync Project. Why: The sync engine is checked in Node against a fake cloud copy, with no browser. How: This runs tests/sync with a minute per test.


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

	webServer : [ // What: Web Server. Why: The suites need the app running, without touching any dev server already open. How: This starts the dev server and the production preview, each on its own strict port from the repo root, and stops both when the run ends.


		{ // What: Dev Server. Why: Every project but the security ones points its baseURL at the app as it's developed. How: This starts the Vite dev server on 5190.


			command             : 'npx vite --port 5190 --strictPort', // What: Command. Why: A strict port fails loudly instead of drifting onto another server's port. How: This starts the Vite dev server on 5190.
			cwd                 : ROO_DIR_STR,                         // What: Current Working Directory. Why: Vite reads its config from the repo root. How: This starts the command there.
			env                 : { VITE_FIREBASE_EMULATOR : '127.0.0.1', VITE_TIP_URL : TIP_URL_STR }, // What: Environment. Why: The Settings suite checks the Buy Me a Coffee button opens its tip page, and the account suite must reach the Firebase Emulator, never the real project. How: This builds the app with the tip placeholder and the emulator's host.
			reuseExistingServer : false,                               // What: Reuse Existing Server. Why: A leftover server could be running other code. How: This always starts a fresh one.
			timeout             : 60000,                               // What: Timeout. Why: The first start can take a while on a cold cache. How: This waits up to a minute for the server to answer.
			url                 : SER_URL_STR                          // What: URL. Why: Playwright starts the tests only once the app answers. How: This is the address it polls.


		},

		{ // What: Preview Server. Why: The security suite and the SEO suite's raw page checks read what ships, and the dev server's inline scripts would break the strict policy. How: This builds the app and serves the build on 5191.


			command             : 'npm run build && npx vite preview --port 5191 --strictPort', // What: Command. Why: The preview serves only a fresh build, and a strict port fails loudly. How: This type checks and builds the app, then serves dist/ on 5191.
			cwd                 : ROO_DIR_STR,                                                  // What: Current Working Directory. Why: The build and Vite read their config from the repo root. How: This starts the command there.
			reuseExistingServer : false,                                                        // What: Reuse Existing Server. Why: A leftover server could be serving an older build. How: This never reuses a server on the port, failing the run if one is there.
			timeout             : 180000,                                                       // What: Timeout. Why: The type check, the app build, and the functions bundle run before the server starts. How: This waits up to three minutes for it to answer.
			url                 : PRE_URL_STR                                                   // What: URL. Why: Playwright starts the tests only once the build is served. How: This is the address it polls.


		}


	]


});

// #endregion Constants



// #region Exports

export default PLA_CON_OBJ; // What: Default Export. Why: Playwright reads its config from this file's default export. How: This exports PLA_CON_OBJ.

// #endregion Exports


