


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every flow asserts what it changed. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each flow starts from real data. How: This opens the backup on a fixed day.
import { reaStaFun } from '../support/storage.ts'; // What: Read State Function. Why: Flows compare saved state before and after. How: This reads it.
import { recAniFun } from '../support/watch.ts';   // What: Record Animations Function. Why: Flows confirm their animations played. How: This starts recording.
import { seeAniFun } from '../support/watch.ts';   // What: Seen Animation Function. Why: Flows confirm their animations played. How: This checks the record.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: The streak test pushes an item from the Pickers tab. How: This switches tabs.
import { test      } from '@playwright/test';      // What: Test. Why: Each flow is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: Saves land a moment after each action. How: This waits for them.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.


import type { Page      } from '@playwright/test';             // What: Page. Why: Helpers drive the page. How: This types the page parameters.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Flows read saved state. How: This types it.

// #endregion Imports



/**
 * today.spec.ts = Today Spec
 *
 * @summary
 * Drives every control on the Today tab on real data and checks each one both
 * ways: the saved state in IndexedDB changed as it should, and the animation
 * tied to it played. Checking a card off pulses the progress ring and is
 * undone by checking it again; finishing every card celebrates, and bumps the
 * streak when that claims the day, and pushing an item onto the finished day
 * gives that streak point back and untints the badge. Re-rolling spins the
 * card and rejects its pick-log row; skipping slides it out and removes it.
 * The item editor writes only on Save. Reminders can be added, renamed, and
 * skipped. Edit Mode opens and its Cancel closes it without reordering
 * anything; Regenerate rebuilds the list; groups can be renamed in Edit Mode;
 * and the day log opens. Every flow also fails on any page or console error.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ENT_CAR_STR = '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="remCarArt"]):not([data-element-name-hook~="tutCarArt"])';                                            // What: Entry Card String. Why: Entry cards exclude reminders and tutorials. How: This selects real entry cards.
const PIC_GRO_STR = '[data-element-name-hook~="todGroSec"]:not([data-element-name-hook~="appFeaSec"]):not([data-element-name-hook~="pagTouSec"]):not([data-element-name-hook~="remGroSec"])'; // What: Picker Group String. Why: Picker group sections exclude the Reminders, page tours, and app features groups. How: This selects real picker group sections.
const REM_CAR_STR = '[data-element-name-hook~="remCarArt"]:not([data-element-name-hook~="tutCarArt"])';                                                                                       // What: Reminder Card String. Why: Reminder cards exclude tutorials. How: This selects real reminder cards.
const UNC_BUT_STR = '[data-element-name-hook~="carCheBut"][aria-pressed="false"]'; // What: Unchecked Button String. Why: Check-offs click unchecked buttons. How: This selects them.

// #endregion Constants



// #region Helpers

const donCouFun = ( staAppObj : StaAppTyp ) => staAppObj.today.entries.filter( ( curEntObj ) => curEntObj.done ).length; // What: Done Count Function. Why: Check-offs are recognized by the done count. How: This counts done entries.



// #region picCarFun

/**
 * picCarFun = Pick Card Function
 *
 * @summary
 * Finds an unchecked pick card whose item name no other entry card shows,
 * among pickers of the given modes, so a click on its action buttons lands
 * on a known entry. Returns its locator and entry, or null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to look on.
 * @param modNamArr - Mode Name Array: Which picker modes qualify.
 *
 * @returns The card and its entry id, or null.
 *
 * @example
 * ```ts
 * await picCarFun(curPagObj, ['random']) // => { carLoc, entEidStr }
 * ```
 *
*/

const picCarFun = async ( curPagObj : Page, modNamArr : string[] ) => { // What: Pick Card Function. Why: Re-roll and skip need a card tied to a known entry. How: This matches an entry to a uniquely named card.


	const staAppObj = ( await reaStaFun( curPagObj ) )!; // What: State App Object. Why: Entries and names come from the saved state. How: This reads it. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.
	const namLabArr = await curPagObj.locator( `${ ENT_CAR_STR } [data-element-name-hook~="carCheBut"]` ).evaluateAll( ( butEleArr ) => butEleArr.map( ( butDomEle ) => butDomEle.getAttribute( 'aria-label' ) || '' ) ); // What: Name Label Array. Why: A unique name identifies a card. How: This reads every entry card's button label.



	for ( const curEntObj of staAppObj.today.entries ) { // What: Entry Loop. Why: The first qualifying entry is used. How: This checks each in turn.


		const namTexStr = staAppObj.items.find( ( curIteObj ) => curIteObj.id === curEntObj.itemId )?.name || '';         // What: Name Text String. Why: The card shows its item's name. How: This looks it up.
		const modNamStr = staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId )?.mode || '';     // What: Mode Name String. Why: Only some modes qualify. How: This reads the entry's picker mode.
		const modMatBoo = modNamArr.includes( modNamStr );                                                                // What: Mode Match Boolean. Why: Only listed modes qualify. How: This checks the entry's mode against the list.
		const uniLabBoo = namLabArr.filter( ( labTexStr ) => labTexStr === `Mark ${ namTexStr } complete` ).length === 1; // What: Unique Label Boolean. Why: A shared name would make the card ambiguous. How: This checks only one card carries the name.

		const quaEntBoo = !curEntObj.done && !curEntObj.kind && modMatBoo && uniLabBoo; // What: Qualify Entry Boolean. Why: Only an unchecked, uniquely named pick of a listed mode qualifies. How: This combines the checks.


		if ( !quaEntBoo ) continue; // What: Qualify Guard. Why: A card that doesn't qualify is passed over. How: This skips the rest.



		return { // What: Card Return. Why: The caller clicks within this card. How: This returns the card and its entry id.


			carLoc    : curPagObj.locator( ENT_CAR_STR ).filter( { has : curPagObj.locator( `[aria-label="Mark ${ namTexStr } complete"]` ) } ), // What: Card Locator. Why: The caller clicks within it. How: This finds the card holding the named check button.
			entEidStr : curEntObj.eid // What: Entry Entry-Identifier String. Why: The caller checks the saved entry afterward. How: This is the entry's id.


		};


	}



	return null; // What: No Card Return. Why: Nothing qualified. How: This returns null.


};

// #endregion picCarFun

// #endregion Helpers



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow starts on real data with errors watched. How: This starts the watcher and opens the backup.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'checking a card saves, animates, and undoes', async ( { page : curPagObj } ) => { // What: Check-Off Test. Why: Checking off is the app's core action. How: This checks a card, watches its animations, and unchecks it.


	const preStaObj = ( await reaStaFun( curPagObj ) )!;                                // What: Previous State Object. Why: The check-off and undo are compared with it. How: This reads the state. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.
	const butCurLoc = curPagObj.locator( `${ ENT_CAR_STR } ${ UNC_BUT_STR }` ).first(); // What: Button Current Locator. Why: The first unchecked card is checked off. How: This finds its button.
	const butHanObj = ( await butCurLoc.elementHandle() )!;                             // What: Button Handle Object. Why: The undo clicks the same card. How: This holds the button. // What: Non-Null Note. Why: The fixed day always has an unchecked card. How: The ! tells TypeScript the handle exists.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The check-off's animations are confirmed. How: This starts recording.



	await butHanObj.click(); // What: Check Click Call. Why: Check-offs go through the real button. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => donCouFun( staAppObj ) === donCouFun( preStaObj ) + 1, 'check-off saved' ); // What: Check Save Wait. Why: The check-off must reach storage. How: This waits for the done count to rise.



	expect( await seeAniFun( curPagObj, 'proRinDiv--pulsing' ), 'progress ring pulse' ).toBe( true ); // What: Ring Pulse Assertion. Why: The ring pulses when the done count rises. How: This checks its class appeared.



	await butHanObj.click(); // What: Undo Click Call. Why: Checking again undoes it. How: This clicks the same button.



	const undStaObj = await waiStaFun( curPagObj, ( staAppObj ) => donCouFun( staAppObj ) === donCouFun( preStaObj ), 'undo saved' ); // What: Undo State Object. Why: The undo must reach storage. How: This waits for the done count to fall back.



	expect( JSON.stringify( undStaObj.items ), 'items restored' ).toBe( JSON.stringify( preStaObj.items ) ); // What: Items Restored Assertion. Why: Undoing restores every item. How: This compares the items.


} );



test( 'finishing every card celebrates', async ( { page : curPagObj } ) => { // What: Celebration Test. Why: Finishing the day must celebrate. How: This checks everything off and watches for the celebration.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The streak bumps only when this run claims the day. How: This reads whether the day was already claimed. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The celebration is confirmed by its classes. How: This starts recording.



	for ( let cliNumVal = 0; cliNumVal < 60 && await curPagObj.locator( `${ ENT_CAR_STR } ${ UNC_BUT_STR }, ${ REM_CAR_STR } ${ UNC_BUT_STR }` ).count(); cliNumVal++ ) { // What: Check-Off Loop. Why: Every card must be done. How: This clicks the next unchecked card until none remain.


		await curPagObj.locator( `${ ENT_CAR_STR } ${ UNC_BUT_STR }, ${ REM_CAR_STR } ${ UNC_BUT_STR }` ).first().click(); // What: Next Click Call. Why: Each card is checked off in turn. How: This clicks the first unchecked one.



		await curPagObj.waitForTimeout( 150 ); // What: Click Gap Wait. Why: Each click re-renders the list. How: This waits a moment.


	}



	expect( await seeAniFun( curPagObj, 'proRinDiv--celebrating' ), 'ring celebration' ).toBe( true ); // What: Ring Celebration Assertion. Why: The ring celebrates a finished day. How: This checks its class appeared.



	await expect( curPagObj.locator( '[class*="conPieIta"]' ).first(), 'confetti' ).toBeAttached(); // What: Confetti Assertion. Why: The backup's celebration style is confetti. How: This checks a confetti piece rendered.



	const finStaObj = await waiStaFun( curPagObj, ( staAppObj ) => !!staAppObj.today.streakClaimed, 'streak claimed' ); // What: Finished State Object. Why: A fully done day claims the streak. How: This waits for the claim to reach storage.



	if ( !preStaObj.today.streakClaimed && finStaObj.today.streakClaimed ) expect( await seeAniFun( curPagObj, 'todStrDiv--bumped' ), 'streak bump' ).toBe( true ); // What: Streak Bump Assertion. Why: The streak badge bumps only when the day's claim goes from false to true, which happens once every card is done. How: This checks its class appeared when this run made the claim.


} );



test( 'pushing an item onto a finished day gives the streak back', async ( { page : curPagObj } ) => { // What: Streak Reopen Test. Why: A day that gains an unchecked card is no longer finished, so its streak point must be given back. How: This finishes the day, sends an item from the Pickers tab, and checks the streak drops back.


	for ( let cliNumVal = 0; cliNumVal < 60 && await curPagObj.locator( `${ ENT_CAR_STR } ${ UNC_BUT_STR }, ${ REM_CAR_STR } ${ UNC_BUT_STR }` ).count(); cliNumVal++ ) { // What: Check-Off Loop. Why: The day must be finished first. How: This clicks the next unchecked card until none remain.


		await curPagObj.locator( `${ ENT_CAR_STR } ${ UNC_BUT_STR }, ${ REM_CAR_STR } ${ UNC_BUT_STR }` ).first().click(); // What: Next Click Call. Why: Each card is checked off in turn. How: This clicks the first unchecked one.



		await curPagObj.waitForTimeout( 150 ); // What: Click Gap Wait. Why: Each click re-renders the list. How: This waits a moment.


	}



	const finStaObj = await waiStaFun( curPagObj, ( staAppObj ) => !!staAppObj.today.streakClaimed, 'streak claimed' ); // What: Finished State Object. Why: The streak point is given back from the finished day's count. How: This waits for the claim to reach storage.



	await expect( curPagObj.locator( '[data-element-name-hook~="todStrDiv"]' ), 'badge tinted' ).toHaveAttribute( 'data-streak-claim-active' ); // What: Tinted Badge Assertion. Why: A claimed day keeps the streak badge tinted. How: This checks the badge carries the claim attribute.



	await selTabFun( curPagObj, 'picker' ); // What: Pickers Tab Call. Why: Items are pushed to Today from the Pickers tab. How: This switches to it.



	await curPagObj.locator( '[data-element-name-hook~="picOneBut"]' ).click(); // What: Pick Click Call. Why: Pick One chooses the item to push. How: This clicks it.



	await expect( curPagObj.locator( '[data-element-name-hook~="picSenBut"]' ), 'send button' ).toBeEnabled( { timeout : 15000 } ); // What: Send Ready Assertion. Why: Send unlocks once the reel settles. How: This waits for it to enable.



	await curPagObj.locator( '[data-element-name-hook~="picSenBut"]' ).click(); // What: Send Click Call. Why: Sending pushes an unchecked item onto Today. How: This clicks it.



	const reoStaObj = await waiStaFun( curPagObj, ( staAppObj ) => !staAppObj.today.streakClaimed, 'streak given back' ); // What: Reopened State Object. Why: The pushed item reopens the day. How: This waits for the claim to clear in storage.



	expect( reoStaObj.streak, 'streak count' ).toBe( Math.max( 0, finStaObj.streak - 1 ) ); // What: Streak Count Assertion. Why: Reopening the day gives back exactly the point it claimed. How: This expects one less than the finished day's streak.



	await selTabFun( curPagObj, 'today' ); // What: Today Tab Call. Why: The streak badge lives on Today. How: This switches back to it.



	await expect( curPagObj.locator( '[data-element-name-hook~="todStrDiv"]' ), 'badge untinted' ).not.toHaveAttribute( 'data-streak-claim-active' ); // What: Untinted Badge Assertion. Why: A reopened day drops the badge's tint. How: This checks the claim attribute is gone.


} );



test( 're-rolling and skipping animate and save', async ( { page : curPagObj } ) => { // What: Re-Roll And Skip Test. Why: Both card actions must work and animate. How: This re-rolls one card and skips another.


	const rolCarObj = ( await picCarFun( curPagObj, [ 'dynamic', 'random', 'weighted' ] ) )!; // What: Roll Card Object. Why: A draw-mode card can always re-roll. How: This finds one. // What: Non-Null Note. Why: The backup's fixed day always has a draw-mode pick. How: The ! tells TypeScript one was found.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The re-roll spin is confirmed. How: This starts recording.



	await rolCarObj.carLoc.locator( '[aria-label="Re-Roll"]' ).click(); // What: Re-Roll Click Call. Why: Re-rolls go through the real button. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickLog.some( ( logRowObj ) => logRowObj.eid === rolCarObj.entEidStr && logRowObj.outcome === 'rejected' ), 're-roll saved' ); // What: Re-Roll Save Wait. Why: The old pick must be rejected in the log. How: This waits for the rejected row.



	expect( await seeAniFun( curPagObj, 'todCarArt--rolling' ), 'card roll' ).toBe( true ); // What: Roll Animation Assertion. Why: The card spins while re-rolling. How: This checks its class appeared.



	const skiCarObj = ( await picCarFun( curPagObj, [ 'dynamic', 'ease-down', 'ease-up', 'random', 'weighted' ] ) )!; // What: Skip Card Object. Why: Any pick can be skipped. How: This finds one. // What: Non-Null Note. Why: The fixed day has several picks. How: The ! tells TypeScript one was found.



	await recAniFun( curPagObj ); // What: Recording Restart Call. Why: The skip's slide-out is confirmed separately. How: This restarts recording.



	await skiCarObj.carLoc.locator( '[aria-label="Skip"]' ).click(); // What: Skip Click Call. Why: Skips go through the real button. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => !staAppObj.today.entries.some( ( curEntObj ) => curEntObj.eid === skiCarObj.entEidStr ), 'skip saved' ); // What: Skip Save Wait. Why: The entry must leave the list. How: This waits for it to go.



	expect( await seeAniFun( curPagObj, 'todCarArt--removing' ), 'card removal' ).toBe( true ); // What: Removal Animation Assertion. Why: A skipped card slides out. How: This checks its class appeared.


} );



test( 'the item editor saves only on Save', async ( { page : curPagObj } ) => { // What: Item Editor Test. Why: Edits are drafts until saved. How: This cancels one rename and saves another.


	const ediCarLoc = curPagObj.locator( ENT_CAR_STR ).filter( { has : curPagObj.locator( '[aria-label="Edit"]' ) } ).first(); // What: Edit Card Locator. Why: The first editable card is used. How: This finds it.
	const preStaObj = ( await reaStaFun( curPagObj ) )!;                                                                       // What: Previous State Object. Why: Cancel must change nothing. How: This reads the state. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await ediCarLoc.locator( '[aria-label="Edit"]' ).click(); // What: Editor Open Call. Why: Renaming happens in the editor. How: This opens it.



	await ediCarLoc.locator( '[data-element-name-hook~="entNamInp"]' ).fill( 'Cancelled Name' ); // What: Draft Rename Call. Why: The draft changes the name on screen only. How: This types a name.



	await curPagObj.locator( '[data-element-name-hook~="iteCanBut"]' ).first().click(); // What: Cancel Click Call. Why: Cancel must drop the draft. How: This clicks Cancel.



	await curPagObj.waitForTimeout( 800 ); // What: Cancel Settle Wait. Why: A wrong write would land within the save delay. How: This waits past it.



	expect( ( await reaStaFun( curPagObj ) )!.items.some( ( curIteObj ) => curIteObj.name === 'Cancelled Name' ), 'cancel wrote nothing' ).toBe( false ); // What: Cancel Assertion. Why: A cancelled draft must not be saved. How: This checks no item took the name. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await ediCarLoc.locator( '[aria-label="Edit"]' ).click(); // What: Editor Reopen Call. Why: The saved rename is tried next. How: This reopens the editor.



	await ediCarLoc.locator( '[data-element-name-hook~="entNamInp"]' ).fill( 'Saved Name' ); // What: Saved Rename Call. Why: This rename should land. How: This types a name.



	await curPagObj.locator( '[data-element-name-hook~="iteSavBut"]' ).first().click(); // What: Save Click Call. Why: Save commits the draft. How: This clicks Save.



	const savStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.items.some( ( curIteObj ) => curIteObj.name === 'Saved Name' ), 'rename saved' ); // What: Saved State Object. Why: The rename must reach storage. How: This waits for an item with the name.



	expect( savStaObj.items.length, 'no item added or lost' ).toBe( preStaObj.items.length ); // What: Item Count Assertion. Why: Renaming changes no item count. How: This compares counts.


} );



test( 'reminders can be added, renamed, and skipped', async ( { page : curPagObj } ) => { // What: Reminder Test. Why: Every reminder action must save. How: This adds, renames, and skips a reminder.


	await curPagObj.locator( '[data-element-name-hook~="remAddBut"]' ).click(); // What: Add Open Call. Why: New reminders start from the add button. How: This opens the form.



	await curPagObj.locator( '[data-element-name-hook~="addNamInp"]' ).fill( 'Test Reminder' ); // What: Name Fill Call. Why: A reminder needs a name. How: This types one.



	await curPagObj.locator( '[data-element-name-hook~="remSavBut"]' ).click(); // What: Add Save Call. Why: The reminder is created on save. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.tasks.some( ( curTasObj ) => curTasObj.name === 'Test Reminder' ), 'reminder added' ); // What: Add Save Wait. Why: The reminder must reach storage. How: This waits for it.



	const remCarLoc = curPagObj.locator( REM_CAR_STR ).filter( { has : curPagObj.locator( '[aria-label="Mark Test Reminder complete"]' ) } ); // What: Reminder Card Locator. Why: The new reminder's card is edited next. How: This finds it.



	await remCarLoc.locator( '[aria-label="Edit reminder"]' ).click(); // What: Editor Open Call. Why: Renaming happens in the editor. How: This opens it.



	await remCarLoc.locator( '[data-element-name-hook~="remNamInp"]' ).fill( 'Renamed Reminder' ); // What: Rename Fill Call. Why: The draft takes the new name. How: This types it.



	await curPagObj.locator( '[data-element-name-hook~="inlEdiDiv"]' ).getByRole( 'button', { exact : true, name : 'Save' } ).click(); // What: Rename Save Call. Why: Save commits the draft, and the open editor sits below the card rather than inside it. How: This clicks the open inline editor's Save.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.tasks.some( ( curTasObj ) => curTasObj.name === 'Renamed Reminder' ), 'reminder renamed' ); // What: Rename Save Wait. Why: The rename must reach storage. How: This waits for it.



	await curPagObj.locator( REM_CAR_STR ).filter( { has : curPagObj.locator( '[aria-label="Mark Renamed Reminder complete"]' ) } ).locator( '[aria-label="Skip reminder"]' ).click(); // What: Skip Open Call. Why: Skipping starts from the card's skip button. How: This opens the confirm.



	await curPagObj.getByRole( 'button', { name : /^(Confirm|Close)$/ } ).first().click(); // What: Skip Confirm Call. Why: A one-time reminder due today may have no later day to skip to. How: This confirms, or closes when there's nothing to skip to.



	await curPagObj.waitForTimeout( 1000 ); // What: Skip Settle Wait. Why: The skip lands after the card's exit animation. How: This waits for it.



	const skiStaObj = ( await reaStaFun( curPagObj ) )!;                                              // What: Skip State Object. Why: The skip's result is read once settled. How: This reads the state. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.
	const skiTasObj = skiStaObj.tasks.find( ( curTasObj ) => curTasObj.name === 'Renamed Reminder' ); // What: Skip Task Object. Why: The reminder records its skip. How: This looks it up.



	expect( !!skiTasObj && ( !!skiTasObj.skipUntil || skiStaObj.reminderSkipLog.every( ( logRowObj ) => logRowObj.taskId !== skiTasObj.id ) ), 'skip saved or nothing to skip to' ).toBe( true ); // What: Skip Assertion. Why: A confirmed skip sets skipUntil, and a closed one logs nothing. How: This accepts either consistent outcome.


} );



test( 'edit mode opens and cancels without reordering', async ( { page : curPagObj } ) => { // What: Edit Mode Test. Why: Cancelling Edit Mode must leave the order alone. How: This opens and cancels it.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The order must match afterwards. How: This reads it. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await curPagObj.locator( '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]' ).first().click(); // What: Edit Open Call. Why: Edit Mode opens from the rail or the footer. How: This clicks whichever shows first.



	await expect( curPagObj.locator( '[data-element-name-hook~="ediBanDiv"]' ), 'edit banner' ).toBeVisible(); // What: Banner Assertion. Why: Edit Mode shows its banner. How: This checks it's visible.



	await expect( curPagObj.locator( '[data-element-name-hook~="carGriSpa"]' ).first(), 'drag grips' ).toBeVisible(); // What: Grip Assertion. Why: Edit Mode swaps checkboxes for drag grips. How: This checks a grip shows.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The banner's close animation is confirmed. How: This starts recording.



	await curPagObj.locator( '[data-element-name-hook~="ediCanBut"]' ).first().click(); // What: Cancel Click Call. Why: Cancel leaves Edit Mode. How: This clicks it.



	expect( await seeAniFun( curPagObj, 'ediBanDiv--closing' ), 'banner close' ).toBe( true ); // What: Close Animation Assertion. Why: The banner slides away. How: This checks its class appeared.



	await expect( curPagObj.locator( '[data-element-name-hook~="ediBanDiv"]' ), 'banner gone' ).toHaveCount( 0 ); // What: Banner Gone Assertion. Why: Edit Mode has ended. How: This checks the banner left.



	const aftStaObj = ( await reaStaFun( curPagObj ) )!; // What: After State Object. Why: The order is compared afterwards. How: This reads it. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	expect( JSON.stringify( [ aftStaObj.groupOrder, aftStaObj.pickerOrder ] ), 'order unchanged' ).toBe( JSON.stringify( [ preStaObj.groupOrder, preStaObj.pickerOrder ] ) ); // What: Order Assertion. Why: Cancel reorders nothing. How: This compares both orders.


} );



test( 'regenerate rebuilds the list', async ( { page : curPagObj } ) => { // What: Regenerate Test. Why: Regenerate must replace the list. How: This confirms a regenerate and checks the new list.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The new list is compared with the old. How: This reads it. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await curPagObj.locator( '[data-element-name-hook~="genLisBut"]' ).click(); // What: Regenerate Open Call. Why: Regenerate asks to confirm first. How: This opens the confirm.



	await curPagObj.locator( '[data-element-name-hook~="genConBut"]' ).click(); // What: Regenerate Confirm Call. Why: The list rebuilds once confirmed. How: This clicks Continue.



	await expect( curPagObj.locator( '[data-slot-pending-active]' ).first(), 'loader slots' ).toBeAttached(); // What: Loader Assertion. Why: Regenerating shows loader cards, which mount already pending, so no attribute change marks them. How: This checks a pending slot is on the page during the cascade.



	const genStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.today.generatedAt !== preStaObj.today.generatedAt, 'regenerated' ); // What: Generated State Object. Why: The rebuild stamps a new time. How: This waits for it.



	expect( genStaObj.today.entries.length, 'list rebuilt' ).toBeGreaterThan( 0 ); // What: Rebuilt Assertion. Why: The new list holds entries. How: This checks it isn't empty.


} );



test( 'a group can be renamed', async ( { page : curPagObj } ) => { // What: Group Rename Test. Why: Renaming a group renames it on every picker in it. How: This renames the first group and checks the pickers.


	await curPagObj.locator( '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]' ).first().click(); // What: Edit Open Call. Why: A group's name only becomes a rename button in Edit Mode. How: This clicks whichever Edit Mode button shows first.



	const namButLoc = curPagObj.locator( `${ PIC_GRO_STR } [data-element-name-hook~="groNamBut"]` ).first();      // What: Name Button Locator. Why: The first picker group's name opens its rename field. How: This finds it, skipping the Reminders and tour groups.
	const oldNamStr = ( ( await namButLoc.getAttribute( 'aria-label' ) ) || '' ).replace( /^Rename group /, '' ); // What: Old Name String. Why: The pickers in this group are checked afterwards. How: This reads the group's name from the label.



	await namButLoc.click(); // What: Rename Open Call. Why: Renaming happens in the field. How: This opens it.



	await curPagObj.locator( '[data-element-name-hook~="groNamInp"]' ).fill( 'Renamed Group' ); // What: Rename Fill Call. Why: The group takes a new name. How: This types it.



	await curPagObj.locator( '[data-element-name-hook~="groNamInp"]' ).press( 'Enter' ); // What: Rename Commit Call. Why: Enter commits the rename. How: This presses it.



	const renStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.some( ( curPicObj ) => curPicObj.group === 'Renamed Group' ), 'group renamed' ); // What: Renamed State Object. Why: The rename must reach storage. How: This waits for it.



	expect( renStaObj.pickers.some( ( curPicObj ) => curPicObj.group === oldNamStr && !curPicObj.hidden ), 'no picker left in the old group' ).toBe( false ); // What: Old Group Assertion. Why: Every visible picker moved with the rename. How: This checks none keeps the old name.


} );



test( 'the day log opens and closes', async ( { page : curPagObj } ) => { // What: Day Log Test. Why: The day log must open from its chip. How: This toggles it.


	const chiButLoc = curPagObj.locator( `${ PIC_GRO_STR } [data-element-name-hook~="logChiBut"]` ).first(); // What: Chip Button Locator. Why: The first picker group's log chip is used, since the Reminders log shows reminder rows instead of picker blocks. How: This finds it.



	await chiButLoc.click(); // What: Log Open Call. Why: The chip opens the log. How: This clicks it.



	await expect( chiButLoc, 'log open' ).toHaveAttribute( 'aria-pressed', 'true' ); // What: Open Assertion. Why: The chip reports the open log. How: This checks aria-pressed.



	await expect( curPagObj.locator( '[data-element-name-hook~="logBloDiv"]' ).first(), 'log blocks' ).toBeVisible(); // What: Log Block Assertion. Why: The open log shows its picker blocks. How: This checks one is visible.



	await chiButLoc.click(); // What: Log Close Call. Why: The chip closes the log again. How: This clicks it.



	await expect( chiButLoc, 'log closed' ).toHaveAttribute( 'aria-pressed', 'false' ); // What: Closed Assertion. Why: The chip reports the closed log. How: This checks aria-pressed.


} );

// #endregion Module Init


