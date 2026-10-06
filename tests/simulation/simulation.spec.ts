


// #region Imports

import { addDayFun     } from './dates.ts';            // What: Add Day Function. Why: Each segment's days count up from its start. How: This shifts a date.
import { addSimFun     } from './scenario.ts';         // What: Add Sim Function. Why: The run covers every schedule whatever the backup holds. How: This adds the scenario's records.
import { cheDonFun     } from './check-completion.ts'; // What: Check Done Function. Why: Every check-off is verified. How: This checks one entry's completion.
import { cheGenFun     } from './check-generation.ts'; // What: Check Generation Function. Why: Every generated day is verified. How: This checks the day's list.
import { cheRemFun     } from './check-completion.ts'; // What: Check Reminder Function. Why: Every reminder check-off is verified. How: This checks one completion.
import { cheUndFun     } from './check-completion.ts'; // What: Check Undo Function. Why: Unchecking must undo exactly. How: This checks one undo.
import { expect        } from '@playwright/test';      // What: Expect. Why: The run passes only with no problems found. How: This asserts the collected list is empty.
import { expStaFun     } from './check-stats.ts';      // What: Expected Stats Function. Why: The Stats tab is checked against the logs. How: This recomputes its figures.
import { insClcFun     } from '../support/clock.ts';   // What: Install Clock Function. Why: The run starts on a fixed date. How: This installs the fake clock.
import { insSeeFun     } from '../support/random.ts';  // What: Install Seed Function. Why: Picks must repeat run to run. How: This seeds the scheduling draws.
import { mkdirSync     } from 'node:fs';               // What: Make Directory Sync. Why: The trace needs its output folder. How: This creates it.
import { opeDayFun     } from '../support/app.ts';     // What: Open Day Function. Why: The run advances a day at a time. How: This opens the app on a day.
import { readFileSync  } from 'node:fs';               // What: Read File Sync. Why: A baseline trace can be compared. How: This reads it.
import { reaFixFun     } from '../support/fixture.ts'; // What: Read Fixture Function. Why: The run starts from real data. How: This reads the backup.
import { reaStaFun     } from '../support/storage.ts'; // What: Read State Function. Why: Each check reads the saved state. How: This reads it.
import { remVisFun     } from './schedule.ts';         // What: Reminder Visible Function. Why: Today's reminders are predicted. How: This decides which show.
import { selTabFun     } from '../support/app.ts';     // What: Select Tab Function. Why: The run ends on the Stats tab. How: This switches tabs.
import { test          } from '@playwright/test';      // What: Test. Why: The simulation is one long Playwright test. How: This declares it.
import { waiStaFun     } from '../support/storage.ts'; // What: Wait State Function. Why: Every click's save lands a moment later. How: This waits for it.
import { watErrFun     } from '../support/watch.ts';   // What: Watch Errors Function. Why: A page error anywhere in the run is a problem. How: This collects them.
import { wriStaFun     } from '../support/storage.ts'; // What: Write State Function. Why: The run starts from the backup. How: This loads it into the page.
import { writeFileSync } from 'node:fs';               // What: Write File Sync. Why: The run leaves a trace for later comparison. How: This writes it.


import type { Locator   } from '@playwright/test';             // What: Locator. Why: Clicks target cards on the page. How: This types the card locators.
import type { Page      } from '@playwright/test';             // What: Page. Why: Every step drives the page. How: This types the page parameters.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Every check compares saved states. How: This types them.

// #endregion Imports



/**
 * simulation.spec.ts = Simulation Spec
 *
 * @summary
 * Runs the real app through weeks of simulated days on a copy of real data
 * and checks every day against the rules. The run loads the backup, seeds
 * the scheduling draws, and fakes the clock, then for each day opens the app
 * at 10 AM Chicago time so the day's list generates on its own. It checks
 * the generated list, checks Today's reminders against the predicted set,
 * then checks everything off one at a time, verifying each check-off and,
 * for the day's first entry, that unchecking undoes it exactly. A few days
 * vary the routine on a fixed schedule, so carried entries, missed
 * periods, overdue one-time reminders, entry skips, re-rolls, and reminder
 * skips all get exercised. The first day is a warm-up: its list is built
 * from the backup's state before the app migrates it, so generation checks
 * start on day two.
 *
 * At the end the Stats tab is compared with figures recomputed from the
 * logs, and each probability conditional's trigger rate is checked against
 * its odds, allowing four standard deviations. A trace of every day's list
 * and conditionals is written to tests/output/simulation; setting
 * EML_SIM_BASELINE to an earlier trace compares this run against it, so a
 * branch can be checked for behavior changes against main with the same
 * seed. EML_SIM_SEED and EML_SIM_SEGMENTS override the seed and the days.
 * The default days are October 5 to November 8, 2026, and December 27,
 * 2026 to January 13, 2027, which covers weekly, monthly, and year-end
 * schedules and a daylight saving change.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type DayTraTyp = { conMapObj : Record< string, [ boolean, number ] >, dayIsoStr : string, entKeyArr : string[], remIdeArr : string[] }; // What: Day Trace Type. Why: Two runs are compared day by day. How: This holds a day's entries, conditionals, and reminders.
type ProRolTyp = { firNum : number, namStr : string, proSumNum : number, rolNum : number, varSumNum : number };                         // What: Probability Roll Type. Why: Each probability conditional's rolls are tallied. How: This holds its fires, expected fires, rolls, and variance.
type SegDefTyp = { dayNum : number, staIsoStr : string };                                                                               // What: Segment Definition Type. Why: The run covers stretches of days. How: This holds a stretch's start and length.

// #endregion Types



// #region Constants

const OUT_DIR_STR = new URL( '../output/simulation/', import.meta.url ); // What: Output Directory String. Why: The trace lands where git ignores it. How: This is tests/output/simulation.
const SEE_VAL_NUM = Number( process.env.EML_SIM_SEED || 20261004 );      // What: Seed Value Number. Why: The same seed repeats the same picks. How: This reads EML_SIM_SEED, defaulting to a fixed seed.



const SEG_DEF_ARR : SegDefTyp[] = process.env.EML_SIM_SEGMENTS ? JSON.parse( process.env.EML_SIM_SEGMENTS ) : [ // What: Segment Definition Array. Why: The default stretches cover weekly, monthly, and year-end schedules. How: This reads EML_SIM_SEGMENTS or uses the defaults.


	{ dayNum : 35, staIsoStr : '2026-10-05' }, // What: Autumn Segment. Why: Five weeks cover every weekly and monthly schedule and a daylight saving change. How: This runs October 5 to November 8, 2026.
	{ dayNum : 18, staIsoStr : '2026-12-27' }  // What: Year End Segment. Why: Crossing a year covers yearly schedules and the gap after a missed stretch. How: This runs December 27, 2026 to January 13, 2027.


];



const ENT_CAR_STR = '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="remCarArt"]):not([data-element-name-hook~="tutCarArt"])'; // What: Entry Card String. Why: Entry cards exclude reminders and tutorials. How: This selects real entry cards.
const REM_CAR_STR = '[data-element-name-hook~="remCarArt"]:not([data-element-name-hook~="tutCarArt"])';                                            // What: Reminder Card String. Why: Reminder cards exclude tutorials. How: This selects real reminder cards.
const CHE_BUT_STR = '[data-element-name-hook~="carCheBut"]';                                                                                       // What: Check Button String. Why: Every card checks off through this button. How: This selects it.

// #endregion Constants



// #region Helpers

const visEntFun = ( staAppObj : StaAppTyp ) => staAppObj.today.entries.filter( ( curEntObj ) => !curEntObj.pickerId || !staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId )?.hidden ); // What: Visible Entry Function. Why: The streak only counts entries Today shows. How: This drops entries of hidden pickers.
const donCouFun = ( staAppObj : StaAppTyp ) => staAppObj.today.entries.filter( ( curEntObj ) => curEntObj.done ).length;                                                                                          // What: Done Count Function. Why: A check-off raises the done count by one. How: This counts done entries.
const remDonFun = ( staAppObj : StaAppTyp, dayIsoStr : string ) => staAppObj.tasks.filter( ( curTasObj ) => curTasObj.lastDone === dayIsoStr ).length;                                                            // What: Reminder Done Function. Why: A reminder check-off raises today's done count by one. How: This counts reminders done today.
const namLabFun = ( ariLabStr : string | null ) => ( ariLabStr || '' ).replace( /^(Un)?[Mm]ark /, '' ).replace( / complete$/, '' );                                                                               // What: Name Label Function. Why: Check buttons name their card in their label. How: This strips the label down to the name.



// #region cliCheFun

/**
 * cliCheFun = Click Check Function
 *
 * @summary
 * Clicks the first unchecked card in a list and waits for its save. The
 * button is clicked through a held element handle so a second click (an
 * undo) hits the same card even after the list re-renders. Returns the
 * handle, the states before and after, or null when no card is unchecked.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to click on.
 * @param carLisLoc - Card List Locator: The cards to choose from.
 * @param couFunObj - Count Function Object: Counts done things in a state, so
 *                    the save is recognized by the count rising.
 *
 * @returns The handle and the states around the click, or null.
 *
 * @example
 * ```ts
 * await cliCheFun(curPagObj, entCarLoc, donCouFun)
 * // => { aftStaObj, butHanObj, preStaObj }
 * ```
 *
*/

const cliCheFun = async ( curPagObj : Page, carLisLoc : Locator, couFunObj : ( staAppObj : StaAppTyp ) => number ) => { // What: Click Check Function. Why: Each check-off is one click and one save. How: This clicks the first unchecked card and waits for the count to rise.


	const butCurLoc = carLisLoc.locator( `${ CHE_BUT_STR }[aria-pressed="false"]` ).first(); // What: Button Current Locator. Why: Only unchecked cards are clicked. How: This finds the first one's check button.



	if ( !await butCurLoc.count() ) return null; // What: Nothing Left Return. Why: The list is done. How: This returns null.



	const butHanObj = ( await butCurLoc.elementHandle() )!; // What: Button Handle Object. Why: An undo must click the same card. How: This holds the button itself. // What: Non-Null Note. Why: The count above just found the button. How: The ! tells TypeScript the handle exists.
	const preStaObj = ( await reaStaFun( curPagObj ) )!;    // What: Previous State Object. Why: The check compares around the click. How: This reads the state first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.
	const preCouNum = couFunObj( preStaObj );               // What: Previous Count Number. Why: The save is recognized by the count rising. How: This counts before the click.



	await butHanObj.click(); // What: Check Click Call. Why: Check-offs go through the real button. How: This clicks it.



	const aftStaObj = await waiStaFun( curPagObj, ( staAppObj ) => couFunObj( staAppObj ) === preCouNum + 1, 'check-off saved' ); // What: After State Object. Why: The check compares around the click. How: This waits for the count to rise and reads the state.



	return { aftStaObj, butHanObj, preStaObj }; // What: Click Result Return. Why: The caller checks the click and may undo it. How: This returns the handle and both states.


};

// #endregion cliCheFun



// #region uniCarFun

/**
 * uniCarFun = Unique Card Function
 *
 * @summary
 * Finds an unchecked entry card, matching a condition, whose name is shown
 * on no other entry card, so a click on its Skip or Re-Roll button lands on
 * a known entry. Returns the card's locator and entry, or null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to look on.
 * @param staAppObj - State App Object: The saved state, for entry names.
 * @param conTesFun - Condition Test Function: Which entries qualify.
 *
 * @returns The card and its entry, or null when none qualifies.
 *
 * @example
 * ```ts
 * await uniCarFun(curPagObj, staAppObj, (curEntObj) => !curEntObj.kind)
 * // => { carLoc, curEntObj }
 * ```
 *
*/

const uniCarFun = async ( curPagObj : Page, staAppObj : StaAppTyp, conTesFun : ( curEntObj : StaAppTyp[ 'today' ][ 'entries' ][ number ] ) => boolean ) => { // What: Unique Card Function. Why: Skip and Re-Roll need a card tied to a known entry. How: This matches an entry to a card by a name no other card shows.


	const namCouMap = new Map< string, number >(); // What: Name Count Map. Why: Only a unique name identifies a card. How: This counts each shown name.



	for ( const ariLabStr of await curPagObj.locator( `${ ENT_CAR_STR } ${ CHE_BUT_STR }` ).evaluateAll( ( butEleArr ) => butEleArr.map( ( butDomEle ) => butDomEle.getAttribute( 'aria-label' ) ) ) ) namCouMap.set( namLabFun( ariLabStr ), ( namCouMap.get( namLabFun( ariLabStr ) ) ?? 0 ) + 1 ); // What: Name Count Loop. Why: Every card's name is counted. How: This reads each check button's label.



	for ( const curEntObj of staAppObj.today.entries ) { // What: Entry Loop. Why: The first qualifying, uniquely named entry is used. How: This checks each entry in turn.


		const namTexStr = staAppObj.items.find( ( curIteObj ) => curIteObj.id === curEntObj.itemId )?.name || ''; // What: Name Text String. Why: The card shows its item's name. How: This looks it up.
		const isaDonBoo = curEntObj.done;                                                                         // What: Is-A Done Boolean. Why: A checked entry can't be clicked again. How: This reads its done flag.
		const entKinStr = curEntObj.kind;                                                                         // What: Entry Kind String. Why: Only plain picks qualify. How: This reads the entry's kind, empty for a pick.
		const notUniBoo = namCouMap.get( namTexStr ) !== 1;                                                       // What: Not Unique Boolean. Why: The card is found by its name, which must be unique. How: This checks the name's count isn't 1.

		const skiEntBoo = isaDonBoo || entKinStr || !conTesFun( curEntObj ) || notUniBoo; // What: Skip Entry Boolean. Why: Only an unchecked, uniquely named pick that meets the condition qualifies. How: This combines the checks, testing the condition only on plain unchecked picks.


		if ( skiEntBoo ) continue; // What: Qualify Guard. Why: Only an unchecked, uniquely named pick that meets the condition qualifies. How: This skips the rest.



		return { // What: Card Return. Why: The caller clicks within this card. How: This returns the card holding the matching button, with its entry.


			carLoc : curPagObj.locator( ENT_CAR_STR ).filter( { has : curPagObj.locator( `${ CHE_BUT_STR }[aria-label="Mark ${ namTexStr } complete"]` ) } ), // What: Card Locator. Why: The caller clicks within this card. How: This finds the card holding the entry's check button.
			curEntObj // What: Current Entry Object. Why: The caller checks the click against this entry. How: This passes the qualifying entry.


		};


	}



	return null; // What: No Card Return. Why: No entry qualified today. How: This returns null.


};

// #endregion uniCarFun



// #region runDayFun

/**
 * runDayFun = Run Day Function
 *
 * @summary
 * Simulates one day: opens it, checks the generated list and the reminders
 * shown, applies the day's variation, checks everything off with each
 * click verified, and checks the streak. Variations follow the day's
 * position in the run: every 7th day from the 4th leaves the last entry and
 * the first reminder unchecked, every 9th from the 6th skips an entry,
 * every 11th from the 9th re-rolls an entry, and every 13th from the 7th
 * skips a recurring reminder. Problems go into the shared list; the day's
 * trace and probability rolls are recorded.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the app.
 * @param dayIsoStr - Day ISO String: The day to simulate.
 * @param dayIndNum - Day Index Number: The day's position in the run.
 * @param preStaObj - Previous State Object: The state the day starts from,
 *                    or null on the warm-up day.
 * @param issMesArr - Issue Message Array: Collects every problem.
 * @param proMapObj - Probability Map Object: Tallies probability rolls.
 * @param traDayArr - Trace Day Array: Collects each day's trace.
 *
 * @returns The state the day ended with.
 *
 * @example
 * ```ts
 * await runDayFun(curPagObj, '2026-10-06', 1, preStaObj, ...)
 * // => the end-of-day state
 * ```
 *
*/

const runDayFun = async ( curPagObj : Page, dayIsoStr : string, dayIndNum : number, preStaObj : StaAppTyp | null, issMesArr : string[], proMapObj : Map< string, ProRolTyp >, traDayArr : DayTraTyp[] ) : Promise< StaAppTyp > => { // What: Run Day Function. Why: The run is a sequence of days. How: This opens, checks, and completes one day.


	const genStaObj = await opeDayFun( curPagObj, dayIsoStr ); // What: Generated State Object. Why: Every check starts from the generated list. How: This opens the day and waits for it.



	// #region Generation Checks

	if ( preStaObj ) issMesArr.push( ...cheGenFun( preStaObj, genStaObj, dayIsoStr ) ); // What: Generation Check Call. Why: The list must follow the rules. How: This checks it against the day before.



	for ( const curConObj of genStaObj.conditionals ) { // What: Probability Tally Loop. Why: Probability gates are checked statistically at the end. How: This tallies each active roll with its odds.


		const isaOffBoo = curConObj.active === false;                                      // What: Is-An Off Boolean. Why: An inactive gate doesn't roll. How: This checks its active flag.
		const notProBoo = ![ 'dynamic', 'random', 'weighted' ].includes( curConObj.mode ); // What: Not Probability Boolean. Why: Only probability gates roll. How: This checks the mode.


		if ( !preStaObj || isaOffBoo || notProBoo ) continue; // What: Roll Guard. Why: Only active probability gates roll. How: This skips the rest.



		const preConObj = preStaObj.conditionals.find( ( oldConObj ) => oldConObj.id === curConObj.id );                                                                                            // What: Previous Conditional Object. Why: The odds come from the conditional before the roll. How: This looks it up.
		const proValNum = curConObj.mode === 'random' ? 0.5 : Math.min( 100, Math.max( 0, ( curConObj.oddsPct ?? 50 ) + ( curConObj.mode === 'dynamic' ? ( preConObj?.value || 0 ) : 0 ) ) ) / 100; // What: Probability Value Number. Why: Each mode sets its own odds. How: This computes the odds the roll used.
		const proRolObj = proMapObj.get( curConObj.id ) || { firNum : 0, namStr : curConObj.name, proSumNum : 0, rolNum : 0, varSumNum : 0 };                                                       // What: Probability Roll Object. Why: Rolls accumulate across days. How: This reads or starts the tally.



		proMapObj.set( curConObj.id, { // What: Tally Update. Why: The fire rate is compared with the expected sum. How: This adds the roll and its odds.


			firNum    : proRolObj.firNum + ( curConObj.triggered ? 1 : 0 ), // What: Fired Number. Why: Fires are compared with the expected sum. How: This adds 1 when the gate triggered.
			namStr    : curConObj.name,                                     // What: Name String. Why: Reports name the conditional. How: This records its current name.
			proSumNum : proRolObj.proSumNum + proValNum,                    // What: Probability Sum Number. Why: The expected fires are the sum of the odds. How: This adds the roll's odds.
			rolNum    : proRolObj.rolNum + 1,                               // What: Roll Number. Why: The rolls are counted. How: This adds 1.
			varSumNum : proRolObj.varSumNum + proValNum * ( 1 - proValNum ) // What: Variance Sum Number. Why: The tolerance scales with the variance. How: This adds the roll's variance.


		} );


	}



	traDayArr.push({ // What: Trace Push. Why: Two runs are compared day by day. How: This records the day's entries, conditionals, and reminders.


		conMapObj : Object.fromEntries( genStaObj.conditionals.map( ( curConObj ) => [ curConObj.id, [ curConObj.triggered, curConObj.value ] ] ) ),                                // What: Conditional Map Object. Why: Each conditional's state is compared. How: This maps each id to its triggered flag and value.
		dayIsoStr, // What: Day ISO String. Why: Days are matched by date. How: This records the simulated day.
		entKeyArr : genStaObj.today.entries.map( ( curEntObj ) => `${ curEntObj.kind || 'pick' }:${ curEntObj.pickerId || curEntObj.conditionalId }:${ curEntObj.itemId || '' }` ), // What: Entry Key Array. Why: Each entry is compared by what it is. How: This builds a key from its kind, source, and item.
		remIdeArr : genStaObj.tasks.filter( ( curTasObj ) => remVisFun( curTasObj, genStaObj, dayIsoStr ) ).map( ( curTasObj ) => curTasObj.id )                                    // What: Reminder Identifier Array. Why: The shown reminders are compared. How: This lists the visible reminders' ids.


	});

	// #endregion Generation Checks



	// #region Reminder Visibility Check

	const expRemArr = genStaObj.tasks.filter( ( curTasObj ) => remVisFun( curTasObj, genStaObj, dayIsoStr ) ).map( ( curTasObj ) => curTasObj.name ).sort();                                                               // What: Expected Reminder Array. Why: Today must show exactly the due reminders. How: This predicts their names.
	const shoRemArr = ( await curPagObj.locator( `${ REM_CAR_STR } ${ CHE_BUT_STR }` ).evaluateAll( ( butEleArr ) => butEleArr.map( ( butDomEle ) => butDomEle.getAttribute( 'aria-label' ) ) ) ).map( namLabFun ).sort(); // What: Shown Reminder Array. Why: The comparison reads what Today shows. How: This reads every reminder card's name.



	if ( JSON.stringify( expRemArr ) !== JSON.stringify( shoRemArr ) ) issMesArr.push( `${ dayIsoStr } reminders: shown ${ JSON.stringify( shoRemArr ) }, expected ${ JSON.stringify( expRemArr ) }` ); // What: Reminder Visibility Report. Why: A missing or extra reminder is a failure. How: This reports both lists.

	// #endregion Reminder Visibility Check



	// #region Day Variations

	if ( dayIndNum % 9 === 5 ) { // What: Entry Skip Variation. Why: Skipping must remove the entry and mark its row skipped. How: This skips a daily pick.


		const skiCarObj = await uniCarFun( curPagObj, ( await reaStaFun( curPagObj ) )!, ( curEntObj ) => ( genStaObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId )?.cadence || 'daily' ) === 'daily' ); // What: Skip Card Object. Why: The skip needs a known daily pick. How: This finds one with a unique name. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



		if ( skiCarObj ) { // What: Skip Branch. Why: A day without a qualifying pick skips nothing. How: This runs only when one was found.


			const preIteStr = JSON.stringify( ( await reaStaFun( curPagObj ) )!.items ); // What: Previous Items String. Why: Skipping an undone entry changes no item. How: This records the items. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



			await skiCarObj.carLoc.locator( '[aria-label="Skip"]' ).click(); // What: Skip Click Call. Why: Skips go through the real button. How: This clicks the card's Skip.



			const aftStaObj = await waiStaFun( curPagObj, ( staAppObj ) => !staAppObj.today.entries.some( ( curEntObj ) => curEntObj.eid === skiCarObj.curEntObj.eid ), 'entry skipped' ); // What: After State Object. Why: The skip is checked once saved. How: This waits for the entry to leave the list.
			const skiRowArr = aftStaObj.pickLog.filter( ( logRowObj ) => logRowObj.eid === skiCarObj.curEntObj.eid ); // What: Skip Row Array. Why: The entry's log rows record the skip. How: This collects them.
			const misRowBoo = !skiRowArr.length;                                                                      // What: Missing Row Boolean. Why: A skip must leave rows behind. How: This checks there are none.
			const badRowBoo = skiRowArr.some( ( logRowObj ) => logRowObj.outcome !== 'skipped' || logRowObj.done );   // What: Bad Row Boolean. Why: Every row must be marked skipped and undone. How: This checks for one that isn't.
			const iteChaBoo = JSON.stringify( aftStaObj.items ) !== preIteStr;                                        // What: Item Changed Boolean. Why: A skip touches no item. How: This compares the items with before.

			const skiBadBoo = misRowBoo || badRowBoo || iteChaBoo; // What: Skip Bad Boolean. Why: Any of these means the skip went wrong. How: This combines them.


			if ( skiBadBoo ) issMesArr.push( `${ dayIsoStr } skip: rows ${ JSON.stringify( skiRowArr ) } or items changed` ); // What: Skip Report. Why: A skip marks its rows skipped and undone and touches no item. How: This reports anything else.


		}


	}



	if ( dayIndNum % 11 === 8 ) { // What: Re-Roll Variation. Why: Re-rolling must reject the old row and log a new one. How: This re-rolls a draw-mode pick, or an Ease Down pick on every other re-roll day.


		const rolModArr = dayIndNum % 22 === 19 ? [ 'ease-down' ] : [ 'dynamic', 'random', 'weighted' ]; // What: Roll Mode Array. Why: An Ease Down re-roll abandons its active item, which must recharge to full, so every other re-roll day re-rolls one. How: This picks the Ease Down mode on those days and the draw modes otherwise.
		const rolCarObj = await uniCarFun( curPagObj, ( await reaStaFun( curPagObj ) )!, ( curEntObj ) => rolModArr.includes( genStaObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId )?.mode || '' ) ); // What: Roll Card Object. Why: The re-roll needs a known draw-mode pick. How: This finds one with a unique name. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



		if ( rolCarObj ) { // What: Re-Roll Branch. Why: A day without a qualifying pick re-rolls nothing. How: This runs only when one was found.


			await rolCarObj.carLoc.locator( '[aria-label="Re-Roll"]' ).click(); // What: Re-Roll Click Call. Why: Re-rolls go through the real button. How: This clicks the card's Re-Roll.



			const aftStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickLog.some( ( logRowObj ) => logRowObj.eid === rolCarObj.curEntObj.eid && logRowObj.source === 'reroll' ), 're-roll saved' ); // What: After State Object. Why: The re-roll is checked once saved. How: This waits for the new row.
			const rolRowArr = aftStaObj.pickLog.filter( ( logRowObj ) => logRowObj.eid === rolCarObj.curEntObj.eid );                                                                                                // What: Roll Row Array. Why: The entry's rows record the re-roll. How: This collects them.
			const rolEntObj = aftStaObj.today.entries.find( ( curEntObj ) => curEntObj.eid === rolCarObj.curEntObj.eid );                                                                                            // What: Roll Entry Object. Why: The entry now holds the new pick. How: This looks it up.
			const rejMisBoo = rolRowArr.filter( ( logRowObj ) => logRowObj.outcome === 'rejected' ).length !== 1;                                                                                                    // What: Rejected Mismatch Boolean. Why: Exactly one row is rejected. How: This checks the rejected count isn't 1.
			const newMisBoo = rolRowArr.filter( ( logRowObj ) => !logRowObj.outcome && logRowObj.source === 'reroll' ).length !== 1;                                                                                 // What: New Mismatch Boolean. Why: Exactly one new reroll row is live. How: This checks the live reroll count isn't 1.



			if ( rejMisBoo || newMisBoo || !rolEntObj || rolEntObj.done || !rolEntObj.pending || rolEntObj.pending.pickedId !== rolEntObj.itemId ) issMesArr.push( `${ dayIsoStr } re-roll: rows ${ JSON.stringify( rolRowArr ) }` ); // What: Re-Roll Report. Why: One row is rejected, one new reroll row is live, and the entry holds an undone new pick. How: This reports anything else.


		}


	}



	if ( dayIndNum % 13 === 6 ) { // What: Reminder Skip Variation. Why: Skipping a reminder must hide it until its next eligible day. How: This skips the first recurring reminder.


		const preStaSki = ( await reaStaFun( curPagObj ) )!;                                                                                                                              // What: Previous State Skip. Why: The skip is checked around the click. How: This reads the state first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.


		const skiTasObj = preStaSki.tasks.find( ( curTasObj ) => { // What: Skip Task Object. Why: Only a shown, unchecked recurring reminder is skipped. How: This finds the first.


			const isaReuBoo = curTasObj.repeat !== 'once';                  // What: Is-A Recurring Boolean. Why: Only recurring reminders can be skipped. How: This checks the repeat rule.
			const isaVisBoo = remVisFun( curTasObj, preStaSki, dayIsoStr ); // What: Is-A Visible Boolean. Why: Only a shown reminder has a Skip button. How: This applies the visibility rule.
			const notDonBoo = curTasObj.lastDone !== dayIsoStr;             // What: Not Done Boolean. Why: A checked reminder isn't skipped. How: This compares its last done day.

			const canSkiBoo = isaReuBoo && isaVisBoo && notDonBoo; // What: Can Skip Boolean. Why: A reminder qualifies only when all three hold. How: This combines them.



			return canSkiBoo; // What: Can Skip Return. Why: The search stops at the first qualifying reminder. How: This returns the combined check.


		} );



		if ( skiTasObj ) { // What: Reminder Skip Branch. Why: A day without one skips nothing. How: This runs only when one was found.


			await curPagObj.locator( REM_CAR_STR ).filter( { has : curPagObj.locator( `[aria-label="Mark ${ skiTasObj.name } complete"]` ) } ).first().locator( '[aria-label="Skip reminder"]' ).click(); // What: Skip Open Click. Why: Reminder skips go through the real button. How: This opens the card's skip confirm.



			await curPagObj.getByRole( 'button', { exact : true, name : 'Confirm' } ).click(); // What: Skip Confirm Click. Why: The skip only lands once confirmed. How: This clicks Confirm.



			const aftStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.reminderSkipLog.length === preStaSki.reminderSkipLog.length + 1, 'reminder skip saved' ); // What: After State Object. Why: The skip is checked once saved. How: This waits for the skip row.
			const aftTasObj = aftStaObj.tasks.find( ( curTasObj ) => curTasObj.id === skiTasObj.id );                                                                          // What: After Task Object. Why: The reminder now holds a skip date. How: This looks it up.
			const logMisBoo = aftStaObj.reminderSkipLog[ aftStaObj.reminderSkipLog.length - 1 ].taskId !== skiTasObj.id;                                                       // What: Log Mismatch Boolean. Why: The new skip row names the reminder. How: This compares the last row's reminder.



			if ( !aftTasObj || !aftTasObj.skipUntil || aftTasObj.skipUntil <= dayIsoStr || logMisBoo ) issMesArr.push( `${ dayIsoStr } reminder skip: skipUntil ${ aftTasObj && aftTasObj.skipUntil }` ); // What: Reminder Skip Report. Why: The reminder hides until a later day and logs its skip. How: This reports anything else.


		}


	}



	const leaUndBoo = dayIndNum % 7 === 3; // What: Leave Undone Boolean. Why: Some days must end unfinished to exercise carrying and overdue reminders. How: This marks every 7th day from the 4th.

	// #endregion Day Variations



	// #region Entry Check-Offs

	const entCarLoc = curPagObj.locator( ENT_CAR_STR ); // What: Entry Card Locator. Why: Check-offs walk the entry cards. How: This selects them.
	let firCliBoo = true;                               // What: First Click Boolean. Why: The day's first check-off also tests undo. How: This marks the first click.



	while ( true ) { // What: Check-Off Loop. Why: Every entry is checked off in turn. How: This clicks the next unchecked card until none remain.


		if ( leaUndBoo && await entCarLoc.locator( `${ CHE_BUT_STR }[aria-pressed="false"]` ).count() <= 1 ) break; // What: Leave Undone Guard. Why: On a leave-undone day the last entry stays unchecked. How: This stops with one left.



		const cliResObj = await cliCheFun( curPagObj, entCarLoc, donCouFun ); // What: Click Result Object. Why: Each check-off is verified. How: This clicks the next card and returns the states.



		if ( !cliResObj ) break; // What: Done Guard. Why: Nothing is left unchecked. How: This ends the loop.



		const entEidStr = cliResObj.aftStaObj.today.entries.find( ( curEntObj ) => curEntObj.done && !cliResObj.preStaObj.today.entries.find( ( oldEntObj ) => oldEntObj.eid === curEntObj.eid )?.done )!.eid; // What: Entry Eid String. Why: The click is identified by which entry became done. How: This finds it. // What: Non-Null Note. Why: The done count just rose by one. How: The ! tells TypeScript the entry exists.



		issMesArr.push( ...cheDonFun( cliResObj.preStaObj, cliResObj.aftStaObj, entEidStr, dayIsoStr ) ); // What: Check-Off Check Call. Why: The completion must apply exactly what was staged. How: This checks the states around the click.



		if ( firCliBoo ) { // What: Undo Branch. Why: Unchecking must undo exactly. How: This unchecks, checks the undo, and checks off again.


			firCliBoo = false; // What: First Click Clear. Why: Only the day's first check-off tests undo. How: This clears the flag.



			await cliResObj.butHanObj.click(); // What: Undo Click Call. Why: Unchecking goes through the same button. How: This clicks it again.



			issMesArr.push( ...cheUndFun( cliResObj.preStaObj, await waiStaFun( curPagObj, ( staAppObj ) => donCouFun( staAppObj ) === donCouFun( cliResObj.preStaObj ), 'undo saved' ), entEidStr, dayIsoStr ) ); // What: Undo Check Call. Why: The state must return to before the check. How: This waits for the undo and compares.



			await cliResObj.butHanObj.click(); // What: Redo Click Call. Why: The entry ends the day checked. How: This checks it off again.



			await waiStaFun( curPagObj, ( staAppObj ) => donCouFun( staAppObj ) === donCouFun( cliResObj.aftStaObj ), 'redo saved' ); // What: Redo Wait. Why: The next click must start from the saved redo. How: This waits for it.


		}


	}

	// #endregion Entry Check-Offs



	// #region Reminder Check-Offs

	const lefNamStr = leaUndBoo ? namLabFun( await curPagObj.locator( `${ REM_CAR_STR } ${ CHE_BUT_STR }[aria-pressed="false"]` ).first().getAttribute( 'aria-label' ).catch( () => null ) ) : ''; // What: Left Name String. Why: A leave-undone day leaves one reminder unchecked. How: This reads the first unchecked reminder's name, or empty.
	const remCarLoc = lefNamStr ? curPagObj.locator( REM_CAR_STR ).filter( { hasNot : curPagObj.locator( `[aria-label="Mark ${ lefNamStr } complete"]` ) } ) : curPagObj.locator( REM_CAR_STR );   // What: Reminder Card Locator. Why: Reminder check-offs walk the reminder cards, minus the one left. How: This selects them.



	while ( true ) { // What: Reminder Loop. Why: Every shown reminder is checked off in turn. How: This clicks the next unchecked card until none remain.


		const cliResObj = await cliCheFun( curPagObj, remCarLoc, ( staAppObj ) => remDonFun( staAppObj, dayIsoStr ) ); // What: Click Result Object. Why: Each reminder check-off is verified. How: This clicks the next card and returns the states.



		if ( !cliResObj ) break; // What: Done Guard. Why: Nothing is left unchecked. How: This ends the loop.



		const tasIdeStr = cliResObj.aftStaObj.tasks.find( ( curTasObj ) => curTasObj.lastDone === dayIsoStr && cliResObj.preStaObj.tasks.find( ( oldTasObj ) => oldTasObj.id === curTasObj.id )?.lastDone !== dayIsoStr )!.id; // What: Task Identifier String. Why: The click is identified by which reminder became done. How: This finds it. // What: Non-Null Note. Why: The done count just rose by one. How: The ! tells TypeScript the reminder exists.



		issMesArr.push( ...cheRemFun( cliResObj.preStaObj, cliResObj.aftStaObj, tasIdeStr, dayIsoStr ) ); // What: Reminder Check Call. Why: The completion must log once. How: This checks the states around the click.


	}

	// #endregion Reminder Check-Offs



	// #region Streak Check

	const endStaObj = ( await reaStaFun( curPagObj ) )!;                                    // What: End State Object. Why: The streak is checked once the day's clicks are saved. How: This reads the final state. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.
	const strTasArr = endStaObj.tasks.filter( ( curTasObj ) => remVisFun( curTasObj, endStaObj, dayIsoStr ) && ( ( endStaObj.reminderOpts || {} )[ curTasObj.repeat === 'once' ? 'once' : 'recurring' ] || {} ).streak !== false ); // What: Streak Task Array. Why: Shown reminders whose class counts toward the streak must be done too. How: This collects them.
	const hasAnyBoo = visEntFun( endStaObj ).length + strTasArr.length > 0;                 // What: Has Any Boolean. Why: An empty day doesn't advance the streak. How: This checks something was shown.
	const entDonBoo = visEntFun( endStaObj ).every( ( curEntObj ) => curEntObj.done );      // What: Entry Done Boolean. Why: Every shown entry must be done. How: This checks each.
	const tasDonBoo = strTasArr.every( ( curTasObj ) => curTasObj.lastDone === dayIsoStr ); // What: Task Done Boolean. Why: Every streak reminder must be done today. How: This checks each.

	const allDonBoo = hasAnyBoo && entDonBoo && tasDonBoo; // What: All Done Boolean. Why: The streak advances only when everything shown is done. How: This checks every entry and streak reminder.


	if ( endStaObj.streak !== genStaObj.streak + ( allDonBoo && !genStaObj.today.streakClaimed ? 1 : 0 ) || endStaObj.today.streakClaimed !== ( allDonBoo || genStaObj.today.streakClaimed ) ) issMesArr.push( `${ dayIsoStr } streak ${ endStaObj.streak } claimed ${ endStaObj.today.streakClaimed }, started ${ genStaObj.streak }, all done ${ allDonBoo }` ); // What: Streak Report. Why: A finished day adds one to the streak, once. How: This compares the streak with the day's start.

	// #endregion Streak Check



	return endStaObj; // What: End State Return. Why: The next day is checked against this one. How: This returns it.


};

// #endregion runDayFun

// #endregion Helpers



// #region Module Init

test.use( { contextOptions : { reducedMotion : 'reduce' }, viewport : { height : 900, width : 1280 } } ); // What: Page Options Call. Why: Reduced motion makes skips and generation immediate, and a wide page shows every card. How: This sets them for this file's pages.



test( 'simulated days follow the scheduling rules', async ( { page : curPagObj }, tesInfObj ) => { // What: Simulation Test. Why: Weeks of real use must follow every rule. How: This loads the backup, runs every day, then checks Stats and the odds.


	const issMesArr : string[] = [];                      // What: Issue Message Array. Why: Every problem across the run is reported together. How: This collects them.
	const proMapObj = new Map< string, ProRolTyp >();     // What: Probability Map Object. Why: Probability gates are checked across the run. How: This tallies their rolls.
	const traDayArr : DayTraTyp[] = [];                   // What: Trace Day Array. Why: The run leaves a trace for comparison. How: This collects each day.
	const fstDayStr = SEG_DEF_ARR[ 0 ].staIsoStr;         // What: First Day String. Why: The clock starts on the run's first day. How: This reads the first segment's start.
	const errMesArr = watErrFun( curPagObj );             // What: Error Message Array. Why: A page error anywhere in the run is a problem. How: This collects page and console errors.

	let preStaObj : StaAppTyp | null = null; // What: Previous State Object. Why: Each day is checked against the one before. How: This starts null for the warm-up day.
	let dayIndNum = 0;                       // What: Day Index Number. Why: Variations follow each day's position. How: This counts days across segments.
	let lasDayStr = fstDayStr;               // What: Last Day String. Why: Stats are checked as of the last day. How: This tracks it.



	await insClcFun( curPagObj, fstDayStr, 10 ); // What: Clock Install Call. Why: The run starts on its first day. How: This installs the fake clock on it.



	await insSeeFun( curPagObj, SEE_VAL_NUM ); // What: Seed Install Call. Why: Picks must repeat run to run. How: This seeds the scheduling draws.



	await wriStaFun( curPagObj, addSimFun( reaFixFun() ) ); // What: Backup Load Call. Why: The run starts from real data plus the scenario's schedules. How: This writes the extended backup into the page.



	for ( const segDefObj of SEG_DEF_ARR ) { // What: Segment Loop. Why: The run covers each stretch of days. How: This walks each segment.


		for ( let segIndNum = 0; segIndNum < segDefObj.dayNum; segIndNum++ ) { // What: Day Loop. Why: Each segment runs day by day. How: This simulates each day in turn.


			lasDayStr = addDayFun( segDefObj.staIsoStr, segIndNum ); // What: Day Advance. Why: Each iteration is the next day. How: This computes it.



			preStaObj = await runDayFun( curPagObj, lasDayStr, dayIndNum++, preStaObj, issMesArr, proMapObj, traDayArr ); // What: Day Run Call. Why: Each day is simulated and checked. How: This runs it and keeps its end state.


		}


	}



	// #region Stats Checks

	await selTabFun( curPagObj, 'stats' ); // What: Stats Tab Call. Why: The run ends by checking the Stats tab. How: This switches to it.



	const staStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.filter( ( curPicObj ) => curPicObj.id.startsWith( 'pkr_ob_' ) ).every( ( curPicObj ) => curPicObj.hidden ), 'stats samples hidden' ); // What: Stats State Object. Why: Stats hides the sample pickers when it mounts, which changes its figures. How: This waits for that and reads the state.



	for ( const [ ranLabStr, ranDayNum ] of [ [ 'All Time', null ], [ 'Month', 30 ], [ 'Week', 7 ] ] as const ) { // What: Range Loop. Why: Each range filters differently. How: This checks three ranges.


		await curPagObj.locator( '[data-element-name-hook~="ranPilBut"]' ).getByText( ranLabStr, { exact : true } ).click(); // What: Range Click Call. Why: Each range is shown through its pill. How: This clicks it.



		const expStaObj = expStaFun( staStaObj, lasDayStr, ranDayNum ); // What: Expected Stats Object. Why: The tab is compared with recomputed figures. How: This computes them for the range.
		const numTexFun = async ( hooNamStr : string ) => ( await curPagObj.locator( `[data-element-name-hook~="${ hooNamStr }"] [class*="staNumDiv"]` ).first().innerText() ).trim(); // What: Number Text Function. Why: Each headline card shows one number. How: This reads a card's number.



		for ( const [ hooNamStr, expTexStr ] of [ [ 'staStrDiv', expStaObj.staStrStr ], [ 'staFulDiv', expStaObj.staFulStr ], [ 'staDonDiv', expStaObj.staDonStr ], [ 'staRatDiv', expStaObj.staRatStr ] ] ) { // What: Headline Loop. Why: Each headline card must match. How: This compares each one.


			const shoTexStr = await numTexFun( hooNamStr ); // What: Shown Text String. Why: The card's number as shown. How: This reads it.



			if ( shoTexStr !== expTexStr ) issMesArr.push( `stats ${ ranLabStr } ${ hooNamStr }: shown ${ shoTexStr }, expected ${ expTexStr }` ); // What: Headline Report. Why: A wrong figure is a failure. How: This reports it.


		}



		const souTexArr = await curPagObj.locator( '[data-element-name-hook~="souBreDiv"] [class*="legValSpa"]' ).allInnerTexts(); // What: Source Text Array. Why: The breakdown shows each source's count. How: This reads them in order.



		if ( souTexArr.map( Number ).join() !== expStaObj.souCouArr.join() ) issMesArr.push( `stats ${ ranLabStr } sources: shown ${ souTexArr }, expected ${ expStaObj.souCouArr }` ); // What: Source Report. Why: A wrong count is a failure. How: This reports it.



		const mosTexArr = await curPagObj.locator( '[data-element-name-hook~="mosPicDiv"] li' ).evaluateAll( ( iteEleArr ) => iteEleArr.map( ( iteDomEle ) => Array.from( iteDomEle.querySelectorAll( 'span' ) ).map( ( spaDomEle ) => spaDomEle.textContent?.trim() ).join( ' ' ) ) ); // What: Most Text Array. Why: The card lists names and counts. How: This joins each row's texts.



		if ( mosTexArr.join( '|' ) !== expStaObj.mosPicArr.join( '|' ) ) issMesArr.push( `stats ${ ranLabStr } most picked: shown ${ mosTexArr }, expected ${ expStaObj.mosPicArr }` ); // What: Most Picked Report. Why: A wrong ranking is a failure. How: This reports it.



		for ( const [ scoLabStr, cheRowArr ] of [ [ 'Reminders', [ [ 'remDonDiv', expStaObj.remDonStr ], [ 'remActDiv', expStaObj.remActStr ], [ 'remBusDiv', expStaObj.remBusStr ] ] ], [ 'Conditionals', [ [ 'conFirDiv', expStaObj.conFirStr ], [ 'conCycDiv', expStaObj.conCycStr ], [ 'conRatDiv', expStaObj.conRatStr ] ] ] ] as const ) { // What: Scope Loop. Why: The reminders and conditionals views have their own cards. How: This switches scope and compares each card.


			await curPagObj.locator( '[data-element-name-hook~="scoTabBut"]' ).filter( { hasText : scoLabStr } ).first().click(); // What: Scope Click Call. Why: Each view is shown through its scope tab. How: This clicks it.



			for ( const [ hooNamStr, expTexStr ] of cheRowArr ) { // What: Scope Card Loop. Why: Each card must match. How: This compares each one.


				const shoTexStr = await numTexFun( hooNamStr ); // What: Shown Text String. Why: The card's number as shown. How: This reads it.



				if ( shoTexStr !== expTexStr ) issMesArr.push( `stats ${ ranLabStr } ${ hooNamStr }: shown ${ shoTexStr }, expected ${ expTexStr }` ); // What: Scope Card Report. Why: A wrong figure is a failure. How: This reports it.


			}


		}



		await curPagObj.locator( '[data-element-name-hook~="scoTabBut"]' ).first().click(); // What: Scope Reset Click. Why: The next range starts from the All scope. How: This clicks the first scope tab.


	}

	// #endregion Stats Checks



	// #region Odds Checks

	for ( const proRolObj of proMapObj.values() ) { // What: Odds Loop. Why: Each probability gate's fires must fit its odds. How: This compares fires with the expected sum.


		const devValNum = Math.abs( proRolObj.firNum - proRolObj.proSumNum ); // What: Deviation Value Number. Why: Fires vary around their expectation. How: This is the gap from the expected sum.



		if ( devValNum > 4 * Math.sqrt( proRolObj.varSumNum ) + 1 ) issMesArr.push( `conditional ${ proRolObj.namStr } fired ${ proRolObj.firNum } of ${ proRolObj.rolNum }, expected about ${ proRolObj.proSumNum.toFixed( 1 ) }` ); // What: Odds Report. Why: A gap past four standard deviations means the odds are wrong. How: This reports it.


	}

	// #endregion Odds Checks



	// #region Trace Output

	mkdirSync( OUT_DIR_STR, { recursive : true } ); // What: Output Folder Call. Why: The trace needs its folder. How: This creates it.



	writeFileSync( new URL( 'trace.json', OUT_DIR_STR ), JSON.stringify( traDayArr, null, '\t' ) + '\n' ); // What: Trace Write Call. Why: Later runs compare against this one. How: This writes the trace.



	if ( process.env.EML_SIM_BASELINE ) { // What: Baseline Branch. Why: A branch is compared with an earlier run. How: This reports every day that differs.


		const basDayArr : DayTraTyp[] = JSON.parse( readFileSync( process.env.EML_SIM_BASELINE, 'utf8' ) ); // What: Baseline Day Array. Why: The earlier run's days. How: This reads its trace.



		for ( const [ dayIndVal, traDayObj ] of traDayArr.entries() ) if ( JSON.stringify( traDayObj ) !== JSON.stringify( basDayArr[ dayIndVal ] ) ) issMesArr.push( `baseline: ${ traDayObj.dayIsoStr } differs from the baseline run` ); // What: Baseline Compare Loop. Why: Any differing day is a behavior change. How: This compares each day.


	}

	// #endregion Trace Output



	issMesArr.push( ...errMesArr ); // What: Error Merge Call. Why: Page errors count as problems too. How: This adds them to the list.



	await tesInfObj.attach( 'problems', { // What: Problems Attach Call. Why: The report should list every problem. How: This attaches them to the test.


		body        : issMesArr.join( '\n' ) || 'none', // What: Body. Why: The attachment lists every problem. How: This joins them by line, or says none.
		contentType : 'text/plain'                      // What: Content Type. Why: The report is plain text. How: This sets its type.


	} );



	expect( issMesArr, issMesArr.slice( 0, 50 ).join( '\n' ) ).toEqual( [] ); // What: No Problems Assertion. Why: The run passes only when every check held. How: This expects the list empty, showing the first 50.


} );

// #endregion Module Init


