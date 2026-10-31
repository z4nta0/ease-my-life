


// #region Imports

import React from 'react'; // What: React. Why: Sync runs as a hook beside the store. How: This is used directly (React.useState, React.useRef, React.useEffect).


import { isoDayFun   } from '../utils/date.ts';          // What: ISO Day Function. Why: The merge needs today's local date. How: This formats it as 'YYYY-MM-DD'.
import { ONB_SPI_ARR } from './onboarding-seed-data.ts'; // What: Onboarding Sample-Picker-Ids Array. Why: The onboarding's sample pickers aren't the person's data. How: This lists their ids.
import { ONB_STI_ARR } from './onboarding-seed-data.ts'; // What: Onboarding Sample-Task-Ids Array. Why: The onboarding's sample reminders aren't the person's data. How: This lists their ids.
import { STG_NAM_OBJ } from './storage.ts';              // What: Storage Namespace Object. Why: The sync's own localStorage keys live in storage, beside the sweep that keeps them. How: This reads their names.
import { synRunFun   } from './sync-engine.ts';          // What: Sync Run Function. Why: Each sync runs through the engine. How: This runs one.


import type { AccUseTyp } from '../platform/firebase.ts'; // What: Account User Type. Why: The hook follows who is signed in. How: This types that account.
import type { ActStoTyp } from './store.ts';              // What: Action Store Type. Why: A merged state is applied through the store's import action. How: This types the actions.
import type { StaAppTyp } from '../core/data-model.ts';   // What: State App Type. Why: Sync reads and replaces the app state. How: This types it.
import type { SynMetTyp } from './sync-engine.ts';        // What: Sync Meta Type. Why: The engine compares against the last sync. How: This types that record.

// #endregion Imports



/**
 * sync-run.ts = Sync Runner
 *
 * @summary
 * Runs paid sync from inside the app: follows the account, and decides when
 * to sync. Firebase loads only for a device that has signed in before (a
 * localStorage flag says so), or that was opened from a sign-in email, or
 * when someone starts signing in, so it never loads for anyone else.
 *
 * A paid account syncs on launch, when the app comes back into view or
 * online, two minutes after the last change, and right away when the app is
 * hidden with a change still waiting. One sync runs at a time, and a request
 * during a sync runs once it ends. A sync that started from a state the
 * person has since changed never replaces their newer state: when it found
 * changes from another device, it's thrown away and run again, so the
 * newer state is merged instead. Today asks it to bring the account's copy
 * in before building a new day's list, so a device opened with an old list
 * takes the one another device already built rather than replacing it.
 *
 * A device's first sync, when the account already holds data and this
 * device has some too, waits for the person to choose which to keep: the
 * account's (the engine's first-sync rule, which keeps this device's past
 * history), or this device's, which replaces the account's copy entirely.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type SynRcdTyp = { changedAt : number, docs? : Record< string, string >, rev? : number, uid? : string }; // What: Sync Record Type. Why: A device keeps what it last synced and when it last changed. How: This is the JSON stored under SYN_MET_STR, with docs and rev only after a first sync.

type SynStaTyp = 'choose' | 'error' | 'newer' | 'offline' | 'synced' | 'syncing' | 'unpaid' | null; // What: Sync Status Type. Why: The account screen says how sync is going. How: This is null while signed out, unpaid before purchase, and one of the sync states after.



type AccSynTyp = { // What: Account Sync Type. Why: The account screen shows the account and sync, and acts on both. How: This is what useSynRunFun returns.


	accErrStr : string | null;                                       // What: Account Error String. Why: A failed sign-in or sync says what went wrong. How: This is a sentence for the account screen, or null.
	accLoaBoo : boolean;                                             // What: Account Loading Boolean. Why: The account screen waits while Firebase loads. How: This is true until the signed-in account is known.
	accUseObj : AccUseTyp | null;                                    // What: Account User Object. Why: The screen shows who is signed in. How: This is the account, or null.
	buySynFun : () => Promise< void >;                               // What: Buy Sync Function. Why: An unpaid account can buy sync. How: This starts a checkout and sends the person to it.
	choAccFun : () => void;                                          // What: Choose Account Function. Why: A first sync can keep the account's data. How: This runs it that way.
	choDevFun : () => void;                                          // What: Choose Device Function. Why: A first sync can keep this device's data instead. How: This runs it, replacing the account's copy.
	finLinFun : ( emaAdrStr : string, linUrlStr? : string ) => void; // What: Finish Link Function. Why: A link opened in another browser, or pasted, still signs in. How: This finishes it with the given address and link, or the one the app was opened from.
	linNeeBoo : boolean;                                             // What: Link Needs Boolean. Why: A link opened where it wasn't requested needs its address typed in. How: This is true while one waits.
	purPenBoo : boolean;                                             // What: Purchase Pending Boolean. Why: Returning from the checkout, the paid claim can take a few seconds to arrive. How: This is true while the hook waits for it.
	senLinFun : ( emaAdrStr : string ) => Promise< boolean >;        // What: Send Link Function. Why: Email sign-in sends a link, and the screen confirms only one that went out. How: This sends one, remembers the address, and resolves true once it's sent.
	sigGooFun : () => void;                                          // What: Sign Google Function. Why: Google is the other way in. How: This opens Google's sign-in window.
	sigOutFun : () => void;                                          // What: Sign Out Function. Why: A device can leave its account and keep its data. How: This signs out and forgets the sync record.
	synBefFun : () => Promise< void >;                               // What: Sync Before Function. Why: A new day's list must not replace one another device already built. How: This brings the account's copy in first.
	synNeeFun : () => boolean;                                       // What: Sync Needed Function. Why: A device with no account to follow builds its list at once. How: This is true when a new day's list has to wait for sync.
	synLasNum : number | null;                                       // What: Sync Last Number. Why: The screen says when it last synced. How: This is that time in milliseconds, or null.
	synNowFun : () => void;                                          // What: Sync Now Function. Why: A person can sync without waiting. How: This runs a sync.
	synStaStr : SynStaTyp;                                           // What: Sync Status String. Why: The screen shows how sync is going. How: This is the current status.
	wipAccFun : ( cloDelBoo : boolean ) => Promise< boolean >; // What: Wipe Account Function. Why: Resetting a signed-in device signs out first, and may delete the cloud copy too. How: This does both, resolving false when it failed and nothing should be wiped.


};

// #endregion Types



// #region Constants

const GEN_WAI_NUM = 10000;  // What: Generate Wait Number. Why: A new day's list waits for the launch sync, but an unreachable cloud mustn't hold it back for long. How: This caps the wait at ten seconds.
const IDL_MIL_NUM = 120000; // What: Idle Milliseconds Number. Why: Syncing on every change would spend the free tier's writes on half-finished edits. How: This waits two minutes after the last change.
const PUR_GAP_NUM = 3000;   // What: Purchase Gap Number. Why: After a purchase, the paid claim lands once Polar's webhook runs. How: This checks for it every three seconds.
const PUR_TRY_NUM = 20;     // What: Purchase Try Number. Why: A webhook that hasn't landed in a minute won't by waiting longer here. How: This stops after 20 checks.
const RET_MIL_NUM = 30000;  // What: Retry Milliseconds Number. Why: A sync that lost every race to another device should try again soon, not wait for the next change. How: This retries after 30 seconds.
const SYN_FRE_NUM = 15000;  // What: Sync Fresh Number. Why: A sync that just finished already brought the cloud's list, so a new day's list needn't wait for another. How: This counts a sync as fresh for 15 seconds.

// #endregion Constants



// #region Helpers

const hasDatFun = ( staAppObj : StaAppTyp ) => ( staAppObj.pickers || [] ).some( ( picCurObj ) => !ONB_SPI_ARR.includes( picCurObj.id ) ) || ( staAppObj.tasks || [] ).some( ( tasCurObj ) => !ONB_STI_ARR.includes( tasCurObj.id ) ); // What: Has Data Function. Why: A first sync only asks which copy to keep when this device has something worth keeping, and the onboarding's hidden samples aren't. How: This is true when it holds any picker or reminder of the person's own.



const isaLinFun = ( locUrlStr : string ) => /[?&]oobCode=/.test( locUrlStr ) && /[?&]mode=signIn(&|$)/.test( locUrlStr ); // What: Is-A Link Function. Why: The app has to spot a sign-in email's link before loading Firebase to check it properly. How: This looks for the link's code and sign-in mode in the address.



const reaKeyFun = ( keyNamStr : string ) => { // What: Read Key Function. Why: Blocked storage must read as nothing rather than throw. How: This reads a localStorage key, or null.


	try { return localStorage.getItem( keyNamStr ); } // What: Key Read Try. Why: The key may hold a value. How: This returns it.

	catch { return null; } // What: Key Read Catch. Why: Blocked storage holds nothing readable. How: This returns null.


};



// #region waiConFun

/**
 * waiConFun = Wait Condition Function
 *
 * @summary
 * Waits until a condition holds or a deadline passes, whichever comes first,
 * checking every 100 milliseconds. The deadline is a moment in time rather
 * than a length, so several waits in a row can share one overall limit.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conTesFun - Condition Test Function: True once the wait is over.
 * @param endTimNum - End Time Number: The deadline, in milliseconds since
 *                    the epoch.
 *
 * @returns A promise that settles once the condition holds or the deadline
 *          passes, with no value.
 *
 * @example
 * ```ts
 * waiConFun(conTesFun, endTimNum) // => Promise<void>
 * ```
 *
*/

const waiConFun = async ( conTesFun : () => boolean, endTimNum : number ) : Promise< void > => {


	while ( !conTesFun() && Date.now() < endTimNum ) await new Promise( ( resFunObj ) => window.setTimeout( resFunObj, 100 ) ); // What: Condition Poll Loop. Why: Neither the account nor a running sync announces when it's done. How: This sleeps 100 milliseconds at a time until the condition holds or the deadline passes.


};

// #endregion waiConFun



const wriMetFun = ( synRcdObj : SynRcdTyp ) => { // What: Write Meta Function. Why: The record has to outlast a reload. How: This stores it as JSON, logging a failure.


	try { localStorage.setItem( STG_NAM_OBJ.SYN_MET_STR, JSON.stringify( synRcdObj ) ); } // What: Record Write Try. Why: The next sync reads it back. How: This stores it.

	catch ( errCatObj ) { console.warn( errCatObj ); } // What: Record Write Catch. Why: Blocked storage only costs a fuller next sync. How: This logs it.


};



// #region reaMetFun

/**
 * reaMetFun = Read Meta Function
 *
 * @summary
 * Reads this device's sync record for an account. A record saved for a
 * different account, or one that can't be read, counts as none, so the next
 * sync is that account's first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param uidValStr - User Identifier Value String: The signed-in account's
 *                    id.
 *
 * @returns The record, with changedAt 0 and no docs when there is none.
 *
 * @example
 * ```ts
 * reaMetFun(uidValStr) // => { changedAt, docs, rev, uid }
 * ```
 *
*/

function reaMetFun ( uidValStr : string ) : SynRcdTyp {


	try { // What: Record Read Try. Why: Blocked storage or a damaged record must not stop sync. How: This parses the record, falling back to none.


		const synRcdObj : SynRcdTyp = JSON.parse( reaKeyFun( STG_NAM_OBJ.SYN_MET_STR ) || 'null' ) || { changedAt : 0 }; // What: Sync Record Object. Why: The record is stored as JSON. How: This parses it, or starts an empty one.



		return synRcdObj.uid && synRcdObj.uid !== uidValStr ? { changedAt : 0 } : synRcdObj; // What: Record Return. Why: Another account's record says nothing about this one. How: This returns an empty record for a different account.


	}

	catch { return { changedAt : 0 }; } // What: Record Read Catch. Why: An unreadable record is the same as none. How: This returns an empty one.


}

// #endregion reaMetFun

// #endregion Helpers



// #region Hooks

// #region useSynRunFun

/**
 * useSynRunFun = Use Sync Run Function
 *
 * @summary
 * Follows the account and runs paid sync for the app (see the file
 * summary for when). A merged state from the cloud is applied through the
 * store's import action, which migrates it and makes the next save
 * authoritative, since a merge can drop rows (today's, when another device
 * regenerated). A change the hook applied itself doesn't count as a change
 * to sync.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStoObj - Action Store Object: {@link useAppStaFun}'s actions.
 * @param staAppObj - State App Object: {@link useAppStaFun}'s state.
 * @param synActBoo - Sync Active Boolean: False while the onboarding demo
 *                    runs on a state that must never sync.
 *
 * @returns The account, the sync status, and their actions.
 *
 * @example
 * ```ts
 * useSynRunFun(actStoObj, staAppObj, !onbDemBoo) // => accSynObj
 * ```
 *
*/

function useSynRunFun ( actStoObj : ActStoTyp, staAppObj : StaAppTyp, synActBoo : boolean ) : AccSynTyp {


	const [ accErrStr, setAccErrStr ] = React.useState< string | null >( null );    // What: Account Error String And Setter. Why: The screen shows the last failure. How: This holds its sentence.
	const [ accLoaBoo, setAccLoaBoo ] = React.useState( false );                    // What: Account Loading Boolean And Setter. Why: The screen waits while Firebase loads. How: This is true until the account is known.
	const [ accUseObj, setAccUseObj ] = React.useState< AccUseTyp | null >( null ); // What: Account User Object And Setter. Why: The screen and sync follow the account. How: This holds it.
	const [ linUrlStr, setLinUrlStr ] = React.useState< string | null >( null );    // What: Link URL String And Setter. Why: A link opened without its remembered address waits for one. How: This holds the link.
	const [ purPenBoo, setPurPenBoo ] = React.useState( false );                    // What: Purchase Pending Boolean And Setter. Why: The screen shows the purchase finishing. How: This is true from the return until the claim arrives.
	const [ synLasNum, setSynLasNum ] = React.useState< number | null >( null );    // What: Sync Last Number And Setter. Why: The screen says when it last synced. How: This holds that time.
	const [ synRawStr, setSynRawStr ] = React.useState< SynStaTyp >( null );        // What: Sync Raw String And Setter. Why: The status of the last sync, before the account decides what it means. How: This holds it.

	const accCurRef = React.useRef< AccUseTyp | null >( null );                                                   // What: Account Current Reference. Why: Listeners and timers read the latest account. How: This mirrors accUseObj.
	const accKnoRef = React.useRef( false );                                                                      // What: Account Known Reference. Why: A new day's list waits until the account is known, which arrives in a callback. How: This is true once the first account callback has run.
	const aplPenRef = React.useRef( false );                                                                      // What: Apply Pending Reference. Why: A state the hook applied isn't a change to sync. How: This marks the next state change as the hook's own.
	const firModRef = React.useRef< Promise< typeof import( '../platform/firebase.ts' ) > | null >( null );       // What: Firebase Module Reference. Why: Firebase loads at most once, and only when needed. How: This holds the import's promise.
	const idlTimRef = React.useRef< number | null >( null );                                                      // What: Idle Timer Reference. Why: The two-minute wait restarts on each change, and hiding the app cuts it short. How: This holds the pending timer.
	const preStaRef = React.useRef( staAppObj );                                                                  // What: Previous State Reference. Why: Only a real change starts the wait, not the first render. How: This holds the last state seen.
	const refOncRef = React.useRef( false );                                                                      // What: Refresh Once Reference. Why: An unpaid account renews its token once per launch, to catch a purchase that landed while the app was closed. How: This is true once that renewal ran.
	const runAgaRef = React.useRef( false );                                                                      // What: Run Again Reference. Why: A request during a sync runs once it ends. How: This marks one.
	const runActRef = React.useRef( false );                                                                      // What: Run Active Reference. Why: Only one sync runs at a time. How: This is true during one.
	const staCurRef = React.useRef( staAppObj );                                                                  // What: State Current Reference. Why: A sync reads, and later compares against, the latest state. How: This mirrors staAppObj.
	const synEndRef = React.useRef( 0 );                                                                          // What: Sync End Reference. Why: A sync that just finished needn't be repeated before a new day's list. How: This holds when the last sync ended, in milliseconds.
	const synRunRef = React.useRef< ( choValStr? : 'account' | 'device' ) => Promise< void > >( async () => {} ); // What: Sync Run Reference. Why: Listeners, timers, and a rerun need the latest sync function. How: This holds it, refreshed every render.
	const watActRef = React.useRef( false );                                                                      // What: Watch Active Reference. Why: The account is watched once. How: This is true once watching starts.
	const wipActRef = React.useRef( false ); // What: Wipe Active Reference. Why: A reset must not be undone by a sync uploading the copy again. How: This is true while a reset runs, and blocks new syncs.



	accCurRef.current = accUseObj; // What: Account Mirror. Why: Callbacks read the latest account. How: This copies it each render.
	staCurRef.current = staAppObj; // What: State Mirror. Why: A sync reads the latest state. How: This copies it each render.



	// #region Account Watching

	const lodFirFun = () => ( firModRef.current ??= import( '../platform/firebase.ts' ) ); // What: Load Firebase Function. Why: Firebase loads only for someone using an account. How: This imports it once, sharing the promise.



	// #region staWatFun

	/**
	 * staWatFun = Start Watch Function
	 *
	 * @summary
	 * Loads Firebase, the first time it's called, and starts following the
	 * account: each change updates the screen and the signed-in flag that
	 * tells the next launch to load Firebase. Later calls return the same
	 * module without watching twice.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns A promise that settles with the Firebase module.
	 *
	 * @example
	 * ```ts
	 * const firModObj = await staWatFun() // => Promise<module>
	 * ```
	 *
	*/

	const staWatFun = async () => {


		const firModObj = await lodFirFun(); // What: Firebase Module Object. Why: Every account call goes through it. How: This loads it.



		if ( watActRef.current ) return firModObj; // What: Already Watching Guard. Why: The account is watched once. How: This returns the module.



		watActRef.current = true; // What: Watch Mark. Why: Later calls must not watch again. How: This records that watching started.
		setAccLoaBoo( true );     // What: Loading Mark. Why: The account isn't known until the first callback. How: This shows loading.


		firModObj.watUseFun( ( nexUseObj ) => { // What: Account Watch Call. Why: Sign-ins, sign-outs, and the paid claim all arrive here. How: This updates the screen and the signed-in flag.


			accKnoRef.current = true; // What: Account Known Mark. Why: A new day's list waiting on the account can go on. How: This records that the account is known, signed in or not.


			setAccUseObj( nexUseObj ); // What: Account Update. Why: The screen and sync follow it. How: This stores it.

			setAccLoaBoo( false ); // What: Loading Clear. Why: The account is known now. How: This ends loading.


			try { // What: Signed-In Flag Try. Why: The next launch loads Firebase only when this device is signed in. How: This sets or clears the flag.


				if ( nexUseObj ) localStorage.setItem( STG_NAM_OBJ.ACC_SIG_STR, '1' ); // What: Flag Set Branch. Why: Someone is signed in. How: This sets the flag.

				else localStorage.removeItem( STG_NAM_OBJ.ACC_SIG_STR ); // What: Flag Clear Branch. Why: Nobody is. How: This clears it.


			}

			catch ( errCatObj ) { console.warn( errCatObj ); } // What: Signed-In Flag Catch. Why: Blocked storage only costs the next launch a sign-in. How: This logs it.


		} );



		return firModObj; // What: Module Return. Why: The caller signs in through it. How: This returns it.


	};

	// #endregion staWatFun



	// #region finLinFun

	/**
	 * finLinFun = Finish Link Function
	 *
	 * @summary
	 * Finishes an emailed-link sign-in with the address it was sent to, using
	 * the given link (a pasted one) or the one the app was opened from. A
	 * failure, such as an expired or already used link, is shown on the
	 * account screen.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param emaAdrStr - Email Address String: The address the link was sent
	 *                    to.
	 * @param pasUrlStr - Pasted URL String: A link pasted from the email, or
	 *                    undefined for the one waiting in linUrlStr.
	 *
	 * @returns A promise that settles once signing in ends, with no value.
	 *
	 * @example
	 * ```ts
	 * await finLinFun('you@example.com') // => Promise<void>
	 * ```
	 *
	*/

	const finLinFun = async ( emaAdrStr : string, pasUrlStr? : string ) => {


		const linCurStr = pasUrlStr || linUrlStr; // What: Link Current String. Why: A pasted link wins over the one the app opened with. How: This picks it.



		if ( !linCurStr ) return; // What: No Link Guard. Why: There's nothing to finish. How: This returns.



		try { // What: Link Finish Try. Why: An expired or wrong link must explain itself. How: This signs in and forgets the remembered address.


			const firModObj = await staWatFun(); // What: Firebase Module Object. Why: The sign-in goes through Firebase. How: This loads and watches.


			if ( !firModObj.isaLinFun( linCurStr ) ) { setAccErrStr( "That isn't a sign-in link from Ease My Life." ); return; } // What: Wrong Link Guard. Why: A pasted address might not be a sign-in link at all. How: This explains and stops.



			await firModObj.finLinFun( emaAdrStr.trim(), linCurStr ); // What: Link Sign-In Call. Why: The link's code signs the address in. How: This finishes it.


			localStorage.removeItem( STG_NAM_OBJ.SIG_EMA_STR ); // What: Address Forget. Why: The address was only needed until the link was used. How: This removes it.
			setAccErrStr( null );                               // What: Error Clear. Why: The sign-in worked. How: This clears any old failure.
			setLinUrlStr( null );                               // What: Link Clear. Why: Nothing waits anymore. How: This clears the link.


		}

		catch ( errCatObj ) { // What: Link Finish Catch. Why: The person needs to know to request a new link. How: This logs and explains.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setAccErrStr( 'That sign-in link has expired or was already used. Request a new one.' ); // What: Failure Message. Why: A new link is the fix. How: This says so.


		}


	};

	// #endregion finLinFun



	React.useEffect( () => { // What: Launch Watch Effect. Why: A device that signed in before, or was opened from a sign-in email, follows its account from launch. How: This starts watching in those cases and finishes a link whose address is remembered.


		if ( !synActBoo ) return; // What: Demo Guard. Why: The onboarding demo never touches the account. How: This returns.



		if ( new URLSearchParams( window.location.search ).get( 'purchase' ) === 'sync' ) { // What: Purchase Return Check. Why: The checkout sends the buyer back marked as a purchase. How: This cleans the address and starts waiting for the claim.


			window.history.replaceState( null, '', window.location.pathname ); // What: Address Clean Call. Why: A reload or bookmark shouldn't repeat the wait. How: This removes the mark.

			setPurPenBoo( true ); // What: Pending Mark. Why: The claim is on its way. How: This starts the wait.


		}



		const linOpeBoo = isaLinFun( window.location.href );      // What: Link Opened Boolean. Why: The app was opened from a sign-in email. How: This checks the address.
		const sigPreBoo = !!reaKeyFun( STG_NAM_OBJ.ACC_SIG_STR ); // What: Signed-In Previously Boolean. Why: A device that signed in before loads Firebase at launch. How: This reads the flag.



		if ( !linOpeBoo && !sigPreBoo ) return; // What: Nothing To Watch Guard. Why: Firebase must not load for anyone else. How: This returns.



		staWatFun().catch( ( errCatObj ) => console.warn( errCatObj ) ); // What: Watch Start Call. Why: The account is followed from launch. How: This loads Firebase and watches, logging a load cut short by a reload or a lost connection rather than leaving it unhandled.



		if ( linOpeBoo ) { // What: Link Arrival Check. Why: A sign-in link has to be finished, and its code removed from the address. How: This hands it on and cleans the address.


			const linHreStr = window.location.href;                 // What: Link Address String. Why: The code is read before the address is cleaned. How: This keeps it.
			const remAdrStr = reaKeyFun( STG_NAM_OBJ.SIG_EMA_STR ); // What: Remembered Address String. Why: The link finishes at once when this browser requested it. How: This reads the remembered address.


			window.history.replaceState( null, '', window.location.pathname ); // What: Address Clean Call. Why: The one-time code must not stay in the address bar, a bookmark, or the history. How: This replaces the address with the bare path.

			setLinUrlStr( linHreStr ); // What: Link Store. Why: Without a remembered address, the screen asks for one. How: This holds the link.


			if ( remAdrStr ) void finLinFun( remAdrStr, linHreStr ); // What: Remembered Finish Call. Why: The same browser that asked can finish without typing. How: This finishes with the remembered address.


		}


	// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: staWatFun and finLinFun are rebuilt on every render, so listing them would rerun this launch-only effect each render, reloading Firebase and finishing a sign-in link twice. How: The effect lists only synActBoo, and the first render's copies stay correct, since staWatFun keeps its watch flag in a ref and finLinFun is handed the link directly.
	}, [ synActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever syncing is switched on or off. How: synActBoo is false during the onboarding demo.

	// #endregion Account Watching



	// #region Sync Running

	synRunRef.current = async ( choValStr ) => { // What: Sync Run Assignment. Why: Every caller runs the latest version of the sync. How: This defines one run, from the account check to applying the result.


		const accRunObj = accCurRef.current; // What: Account Run Object. Why: Only a paid account syncs. How: This reads the account.



		if ( !accRunObj || !accRunObj.paiBoo || wipActRef.current ) return; // What: Unpaid Guard. Why: Sync is the paid feature, and never runs during a reset. How: This returns.



		if ( runActRef.current ) { runAgaRef.current = true; return; } // What: Busy Guard. Why: One sync runs at a time. How: This asks for another once it ends.



		runActRef.current = true;  // What: Run Mark. Why: Other requests wait for this sync. How: This marks it running.
		setSynRawStr( 'syncing' ); // What: Syncing Status. Why: The screen shows the sync. How: This sets the status.



		try { // What: Sync Try. Why: A network failure must leave the app working and try again later. How: This runs the sync and applies its result.


			const bacModObj = await import( '../platform/cloud-backend.ts' ); // What: Backend Module Object. Why: The Firestore backend loads only for a paid account. How: This imports it.
			const begStaObj = staCurRef.current;                              // What: Begin State Object. Why: The result is applied only if the state hasn't moved since. How: This keeps the state the sync starts from.
			const metRcdObj = reaMetFun( accRunObj.uidStr );                  // What: Meta Record Object. Why: The engine compares against the last sync. How: This reads this device's record.
			const synBacObj = bacModObj.cloBacFun( accRunObj.uidStr );        // What: Sync Backend Object. Why: The sync reads and writes this account's copy. How: This builds its backend.

			let synMetObj : SynMetTyp | null = metRcdObj.docs ? { docs : metRcdObj.docs, rev : metRcdObj.rev || 0 } : null; // What: Sync Meta Object. Why: A device that synced before compares against that sync. How: This reads its hashes and revision, or null before a first sync.



			if ( !synMetObj ) { // What: First Sync Check. Why: A first sync onto an account that already has data may need the person's choice. How: This reads the account's manifest and asks or follows the choice.


				const remManObj = await synBacObj.getManFun(); // What: Remote Manifest Object. Why: Only an account that already holds data needs a choice. How: This reads its manifest.



				if ( remManObj && hasDatFun( begStaObj ) && !choValStr ) { setSynRawStr( 'choose' ); return; } // What: Choice Guard. Why: Both copies hold data, and only the person knows which to keep. How: This waits for their choice.



				if ( remManObj && choValStr === 'device' ) synMetObj = { docs : remManObj.docs, rev : remManObj.rev }; // What: Device Choice. Why: Keeping this device means the account's copy counts as unchanged, so this device's documents replace it entirely. How: This uses the account's hashes as the last sync.


			}



			const resSynObj = await synRunFun( synBacObj, begStaObj, metRcdObj.changedAt, synMetObj, isoDayFun( new Date() ) ); // What: Result Sync Object. Why: The engine does the sync. How: This runs it from begStaObj.



			if ( resSynObj.synStaStr === 'newer' ) { setSynRawStr( 'newer' ); return; } // What: Newer Schema Guard. Why: This version of the app can't read the account's copy. How: This shows the status and stops.



			if ( resSynObj.synStaStr === 'busy' ) { // What: Busy Check. Why: Another device kept committing first, so this one tries again shortly. How: This schedules a retry and stops.


				window.setTimeout( () => void synRunRef.current(), RET_MIL_NUM ); // What: Retry Schedule. Why: The other device will finish soon. How: This syncs again after RET_MIL_NUM.

				setSynRawStr( 'synced' ); // What: Busy Status. Why: Nothing is wrong, the cloud is just busy. How: This keeps the status calm.



				return;


			}



			const staMovBoo = staCurRef.current !== begStaObj; // What: State Moved Boolean. Why: A newer local state must never be replaced by a merge of an older one. How: This is true when the state changed during the sync.



			if ( staMovBoo && resSynObj.merStaObj ) { runAgaRef.current = true; return; } // What: Stale Merge Guard. Why: The merge was built from an older state, so applying it would lose the newer change. How: This throws the result away and runs again, keeping the last sync's record so the change is merged instead.



			wriMetFun( { changedAt : metRcdObj.changedAt, docs : resSynObj.synMetObj!.docs, rev : resSynObj.synMetObj!.rev, uid : accRunObj.uidStr } ); // What: Record Save. Why: The next sync compares against this one. How: This stores its hashes and revision under this account. // What: Non-Null Note. Why: A synced result always carries the meta it synced to. How: The ! tells TypeScript it exists.



			if ( resSynObj.merStaObj ) { // What: Merge Apply Check. Why: Changes from another device land here. How: This replaces the state through the import action, marked as the hook's own change.


				aplPenRef.current = true; // What: Own Change Mark. Why: The change effect must not treat this as a local edit. How: This marks it.

				actStoObj.impDatFun( resSynObj.merStaObj ); // What: State Replace Call. Why: The merged state becomes the app's. How: This imports it.


			}



			runAgaRef.current ||= staMovBoo; // What: Rerun Mark. Why: A change made during the sync still has to be uploaded. How: This asks for another sync when the state moved.
			setAccErrStr( null );            // What: Error Clear. Why: The sync worked. How: This clears any old failure.
			setSynLasNum( Date.now() );      // What: Last Sync Time. Why: The screen says when it last synced. How: This records now.
			setSynRawStr( 'synced' );        // What: Synced Status. Why: The screen shows the sync finished. How: This sets the status.


		}

		catch ( errCatObj ) { // What: Sync Catch. Why: A failed sync must explain itself and leave the app working. How: This logs and shows it.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setSynRawStr( navigator.onLine ? 'error' : 'offline' ); // What: Failure Status. Why: Being offline is normal, and any other failure isn't. How: This picks the status by connection.


		}

		finally { // What: Sync Finally. Why: Every sync has to release the lock and honor a waiting request. How: This clears the mark and runs again when asked.


			runActRef.current = false; // What: Run Clear. Why: The next request may run. How: This clears the mark.

			synEndRef.current = Date.now(); // What: Sync End Mark. Why: A new day's list needn't wait for another sync right after this one. How: This records when it ended.


			if ( runAgaRef.current ) { // What: Rerun Check. Why: A request arrived during the sync. How: This runs again once this one has unwound.


				runAgaRef.current = false; // What: Rerun Clear. Why: The request is being honored. How: This clears it.

				window.setTimeout( () => void synRunRef.current(), 0 ); // What: Rerun Schedule. Why: The lock is released only after this block. How: This runs on the next tick.


			}


		}


	};



	React.useEffect( () => { // What: Change Wait Effect. Why: Changes sync two minutes after the last one, so a burst of edits costs one upload. How: This records the change time and restarts the wait on every real change.


		if ( preStaRef.current === staAppObj ) return; // What: Same State Guard. Why: The first render, or a rerender without a change, isn't a change. How: This returns.



		preStaRef.current = staAppObj; // What: Previous State Update. Why: The next change compares against this one. How: This stores it.



		if ( aplPenRef.current ) { aplPenRef.current = false; return; } // What: Own Change Guard. Why: A state the hook applied came from the cloud. How: This clears the mark and returns.



		if ( !accCurRef.current || !accCurRef.current.paiBoo ) return; // What: Unpaid Guard. Why: Only a paid account tracks changes. How: This returns.



		wriMetFun( { ...reaMetFun( accCurRef.current.uidStr ), changedAt : Date.now(), uid : accCurRef.current.uidStr } ); // What: Change Time Save. Why: A conflict goes to the side that changed last. How: This records now as this device's last change.


		if ( idlTimRef.current ) window.clearTimeout( idlTimRef.current ); // What: Wait Restart. Why: Each change restarts the two minutes. How: This clears the pending wait.


		idlTimRef.current = window.setTimeout( () => { idlTimRef.current = null; void synRunRef.current(); }, IDL_MIL_NUM ); // What: Wait Start. Why: The sync runs once changes stop. How: This syncs two minutes from now.


	}, [ staAppObj ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the state changes. How: staAppObj is the state.



	React.useEffect( () => { // What: Paid Start Effect. Why: A paid account syncs as soon as it's known, which is the launch pull. How: This runs a sync when the account or its paid claim changes.


		if ( accUseObj && accUseObj.paiBoo ) void synRunRef.current(); // What: Paid Sync Call. Why: The account is ready to sync. How: This runs one.


	}, [ accUseObj ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the account changes. How: accUseObj changes on sign-in, sign-out, and a renewed token.



	React.useEffect( () => { // What: Launch Renewal Effect. Why: The paid claim only reaches a device when its token is renewed, which otherwise happens hourly, so a purchase that landed late would wait. How: This renews an unpaid account's token once per launch.


		if ( !accUseObj || accUseObj.paiBoo || refOncRef.current ) return; // What: Renewal Guard. Why: Only an unpaid account needs it, and only once. How: This returns otherwise.



		refOncRef.current = true; // What: Renewal Mark. Why: The renewal reports a new token, which mustn't trigger another. How: This marks it done.


		lodFirFun().then( ( firModObj ) => firModObj.refTokFun() ).catch( ( errCatObj ) => console.warn( errCatObj ) ); // What: Token Renewal Call. Why: A late purchase shows up on the next launch. How: This forces a fresh token, logging a failure rather than leaving it unhandled.


	}, [ accUseObj ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the account changes. How: accUseObj changes once the account is known.



	const paiNowBoo = !!accUseObj && accUseObj.paiBoo; // What: Paid Now Boolean. Why: The purchase wait follows whether the account is paid, not each renewed token. How: This is true for a paid account.
	const sigNowBoo = !!accUseObj;                     // What: Signed Now Boolean. Why: The wait needs someone signed in. How: This is true while one is.



	React.useEffect( () => { // What: Purchase Wait Effect. Why: The paid claim reaches the device only when its token is renewed, which normally happens hourly. How: This renews it every PUR_GAP_NUM until the account is paid, giving up after PUR_TRY_NUM tries.


		if ( !purPenBoo || !sigNowBoo ) return; // What: Not Waiting Guard. Why: Only a returning buyer waits. How: This returns.



		if ( paiNowBoo ) { setPurPenBoo( false ); return; } // What: Arrived Guard. Why: The claim is here, and the paid start effect syncs. How: This ends the wait.



		let tryCouNum = 0; // What: Try Count Number. Why: The wait gives up eventually. How: This counts the renewals.



		const purTimNum = window.setInterval( () => { // What: Purchase Timer Number. Why: Each tick renews the token, which reports a new claim. How: This renews it, or gives up after PUR_TRY_NUM.


			tryCouNum += 1; // What: Try Count. Why: The wait is bounded. How: This counts one more.



			if ( tryCouNum > PUR_TRY_NUM ) { // What: Give Up Check. Why: A minute is long enough to tell something's wrong. How: This stops and explains.


				window.clearInterval( purTimNum ); // What: Timer Stop. Why: No more renewals. How: This clears it.

				setPurPenBoo( false ); // What: Pending Clear. Why: The wait is over. How: This ends it.

				setAccErrStr( "Your purchase hasn't come through yet. It can take a few minutes, so reload the app to check again, or contact support if it doesn't." ); // What: Delay Message. Why: The person paid and deserves to know what's next. How: This explains.



				return;


			}



			lodFirFun().then( ( firModObj ) => firModObj.refTokFun() ).catch( ( errCatObj ) => console.warn( errCatObj ) ); // What: Token Renewal Call. Why: A renewed token carries a newly set claim. How: This forces one, logging a failure rather than leaving it unhandled.


		}, PUR_GAP_NUM );



		return () => window.clearInterval( purTimNum ); // What: Timer Cleanup. Why: The wait ends with the effect. How: This clears the timer.


	}, [ paiNowBoo, purPenBoo, sigNowBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the wait starts or ends. How: purPenBoo starts it, and paiNowBoo or sigNowBoo changing ends or restarts it.



	React.useEffect( () => { // What: Page Event Effect. Why: Coming back into view or online pulls, and being hidden with a change waiting pushes. How: This listens for those page events.


		if ( !synActBoo ) return; // What: Demo Guard. Why: The onboarding demo never syncs. How: This returns.



		const visChaFun = () => { // What: Visibility Change Function. Why: Hiding and showing the app are the moments to push and pull. How: This syncs on show, and on hide when a change is waiting.


			if ( document.visibilityState === 'visible' ) { void synRunRef.current(); return; } // What: Shown Branch. Why: Another device may have synced meanwhile. How: This pulls.



			if ( !idlTimRef.current ) return; // What: Nothing Waiting Guard. Why: Hiding without a change needs no upload. How: This returns.



			window.clearTimeout( idlTimRef.current ); // What: Wait Cancel. Why: The app may never come back, so the change goes up now. How: This cancels the wait.

			idlTimRef.current = null; // What: Wait Clear. Why: Nothing waits anymore. How: This clears it.


			void synRunRef.current(); // What: Hidden Sync Call. Why: The waiting change has to reach the cloud. How: This syncs now.


		};

		const onlRunFun = () => void synRunRef.current(); // What: Online Run Function. Why: Coming back online is the moment to catch up. How: This syncs.



		document.addEventListener( 'visibilitychange', visChaFun ); // What: Visibility Listener. Why: Showing and hiding the app trigger syncs. How: This listens.
		window.addEventListener( 'focus', onlRunFun );              // What: Focus Listener. Why: Returning to the window pulls. How: This listens.
		window.addEventListener( 'online', onlRunFun );             // What: Online Listener. Why: Reconnecting catches up. How: This listens.



		return () => { // What: Listener Cleanup. Why: The listeners end with the app. How: This removes all three.


			document.removeEventListener( 'visibilitychange', visChaFun ); // What: Visibility Removal. Why: The listener ends. How: This removes it.
			window.removeEventListener( 'focus', onlRunFun );              // What: Focus Removal. Why: The listener ends. How: This removes it.
			window.removeEventListener( 'online', onlRunFun );             // What: Online Removal. Why: The listener ends. How: This removes it.


		};


	}, [ synActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever syncing is switched on or off. How: synActBoo is false during the onboarding demo.



	const synNeeFun = () => synActBoo && ( watActRef.current || !!reaKeyFun( STG_NAM_OBJ.ACC_SIG_STR ) ); // What: Sync Needed Function. Why: Only a device following an account has a copy to bring in before a new day's list, and the demo never syncs. How: This is true outside the demo when this device is following an account or was signed in last time.



	// #region synBefFun

	/**
	 * synBefFun = Sync Before Function
	 *
	 * @summary
	 * Brings the account's copy in before Today builds a new day's list, so a
	 * device opened with an old list takes the list another device already
	 * built and checked off, rather than building its own and replacing that
	 * one. It waits for the account to be known and for any running sync to
	 * end, then runs a sync of its own unless one finished moments ago. The
	 * whole wait stops after GEN_WAI_NUM, so a cloud that can't be reached only
	 * delays the list. It assumes synNeeFun is true, and does no check of its
	 * own.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns A promise that settles once the wait is over, with no value.
	 *
	 * @example
	 * ```ts
	 * await synBefFun() // => Promise<void>
	 * ```
	 *
	*/

	const synBefFun = async () : Promise< void > => { // What: Sync Before Function. Why: See the summary above. How: This waits for the account and a sync, bounded by GEN_WAI_NUM.


		const endTimNum = Date.now() + GEN_WAI_NUM; // What: End Time Number. Why: Every wait below shares one limit. How: This is the deadline.


		await waiConFun( () => accKnoRef.current, endTimNum ); // What: Account Wait. Why: Only a paid account syncs, and the account loads after launch. How: This waits until it's known.



		if ( !accCurRef.current || !accCurRef.current.paiBoo ) return; // What: Unpaid Guard. Why: A signed-out or unpaid device has no copy to bring in. How: This returns.



		await waiConFun( () => !runActRef.current, endTimNum ); // What: Running Sync Wait. Why: The launch sync may already be underway. How: This waits for it to end.



		if ( Date.now() - synEndRef.current > SYN_FRE_NUM ) await Promise.race( [ synRunRef.current(), waiConFun( () => false, endTimNum ) ] ); // What: Fresh Sync Call. Why: The cloud's list has to be checked unless a sync just did. How: This runs a sync, giving up on waiting for it at the deadline.


	};

	// #endregion synBefFun

	// #endregion Sync Running



	// #region Account Actions

	const buySynFun = async () : Promise< void > => { // What: Buy Sync Function. Why: An unpaid account buys sync through Polar. How: This asks the checkout function for a checkout and sends the person to it, explaining a failure.


		try { // What: Checkout Try. Why: A network or setup failure must explain itself. How: This proves who is buying and opens the checkout.


			const ideTokStr = await ( await staWatFun() ).tokGetFun(); // What: Identity Token String. Why: The checkout function verifies the buyer. How: This gets the account's token.



			if ( !ideTokStr ) { setAccErrStr( 'Sign in first.' ); return; } // What: Signed Out Guard. Why: Only a signed-in account can buy. How: This explains and stops.



			const cheResObj = await fetch( '/.netlify/functions/checkout', { headers : { 'Authorization' : `Bearer ${ ideTokStr }` }, method : 'POST' } ); // What: Checkout Response Object. Why: The function creates the checkout. How: This posts the token to it.
			const cheBodObj = await cheResObj.json().catch( () => ( {} ) ) as { error? : string, url? : string };                                          // What: Checkout Body Object. Why: The reply holds the address or a sentence. How: This parses it, or nothing when it isn't JSON. // What: Type Assertion Note. Why: The function always answers with url or error. How: The as types its reply.



			if ( !cheResObj.ok || !cheBodObj.url ) { setAccErrStr( cheBodObj.error || "The checkout couldn't be started. Try again in a moment." ); return; } // What: Refused Guard. Why: The function explains its refusals. How: This shows its sentence and stops.



			window.location.assign( cheBodObj.url ); // What: Checkout Navigation. Why: Payment happens on Polar's page, which returns here after. How: This opens it.


		}

		catch ( errCatObj ) { // What: Checkout Catch. Why: The checkout couldn't be reached. How: This logs and explains.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setAccErrStr( "The checkout couldn't be started. Check your connection, then try again." ); // What: Failure Message. Why: A connection problem is the usual cause. How: This says so.


		}


	};



	// #region wipAccFun

	/**
	 * wipAccFun = Wipe Account Function
	 *
	 * @summary
	 * Handles the account's part of a device reset: signs out when someone is
	 * signed in, deleting the cloud copy first when asked. It blocks new syncs
	 * and waits for one in progress to finish, so nothing uploads the copy
	 * again between the deletion and the sign-out, and syncing stays blocked
	 * until the caller wipes the device and the app reloads. If the deletion
	 * or the sign-out fails, it reports that, so the caller wipes nothing and
	 * the person can try again with nothing lost.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param cloDelBoo - Cloud Delete Boolean: Whether to delete the cloud
	 *                    copy too.
	 *
	 * @returns A promise that settles true when the device may be wiped, or
	 *          false when the account part failed.
	 *
	 * @example
	 * ```ts
	 * await wipAccFun(true) // => Promise<boolean>
	 * ```
	 *
	*/

	const wipAccFun = async ( cloDelBoo : boolean ) : Promise< boolean > => {


		const accWipObj = accCurRef.current; // What: Account Wipe Object. Why: The account in use when the reset began is the one signed out. How: This reads it.



		if ( accWipObj ) { // What: Signed In Check. Why: A signed-out device only needs wiping. How: This handles the account first.


			wipActRef.current = true; // What: Sync Block. Why: No sync may start during the reset. How: This marks the reset running.


			for ( let waiCouNum = 0; runActRef.current && waiCouNum < 100; waiCouNum++ ) await new Promise( ( resFunObj ) => window.setTimeout( resFunObj, 100 ) ); // What: Running Sync Wait. Why: A sync in progress could upload the copy again after it's deleted. How: This waits up to ten seconds for it to finish.



			try { // What: Account Reset Try. Why: A failed deletion or sign-out must leave everything as it was. How: This deletes the copy when asked, then signs out.


				if ( cloDelBoo ) await ( await import( '../platform/cloud-backend.ts' ) ).delCloFun( accWipObj.uidStr ); // What: Cloud Delete Call. Why: The person asked for their cloud copy to go too. How: This deletes it.


				await ( await staWatFun() ).sigOutFun(); // What: Sign-Out Call. Why: A reset device shouldn't stay signed in. How: This ends the session.


			}

			catch ( errCatObj ) { // What: Account Reset Catch. Why: The person needs to know nothing was reset. How: This logs, explains, and stops.


				console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

				wipActRef.current = false; // What: Sync Unblock. Why: The reset didn't happen, so syncing carries on. How: This clears the mark.

				setAccErrStr( cloDelBoo ? "Your cloud copy couldn't be deleted, so nothing was reset. Check your connection, then try again." : "Signing out didn't finish, so nothing was reset. Try again." ); // What: Failure Message. Why: The person can simply retry. How: This says what failed.



				return false;


			}


		}



		return true; // What: Ready Return. Why: The caller wipes the device once the account part is done. How: This reports it may.


	};

	// #endregion wipAccFun



	const sigGooFun = async () => { // What: Sign Google Function. Why: Google is one way in. How: This opens its window and explains a failure.


		try { // What: Google Sign-In Try. Why: The window can be closed or blocked. How: This signs in and clears any old failure.


			await ( await staWatFun() ).sigGooFun(); // What: Google Sign-In Call. Why: Google's window does the sign-in. How: This opens it and waits.

			setAccErrStr( null ); // What: Error Clear. Why: The sign-in worked. How: This clears any old failure.


		}

		catch ( errCatObj ) { // What: Google Sign-In Catch. Why: A closed or blocked window is the usual cause. How: This logs and explains it.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setAccErrStr( "Google sign-in didn't finish. Check that pop-ups are allowed, then try again." ); // What: Failure Message. Why: Pop-ups are the usual cause. How: This says so.


		}


	};



	const senLinFun = async ( emaAdrStr : string ) : Promise< boolean > => { // What: Send Link Function. Why: Email sign-in sends a link. How: This remembers the address, sends the link, and explains a failure, resolving whether it went out.


		try { // What: Link Send Try. Why: A bad address or a network failure must explain itself. How: This remembers the address and sends the link.


			localStorage.setItem( STG_NAM_OBJ.SIG_EMA_STR, emaAdrStr.trim() ); // What: Address Remember. Why: Opening the link in this browser finishes without typing it again. How: This stores the address.


			await ( await staWatFun() ).senLinFun( emaAdrStr.trim(), `${ window.location.origin }/` ); // What: Link Send Call. Why: The link leads back to this app. How: This sends it with the app's address.


			setAccErrStr( null ); // What: Error Clear. Why: The link went out. How: This clears any old failure.



			return true; // What: Sent Return. Why: The screen confirms the link. How: This reports it went out.


		}

		catch ( errCatObj ) { // What: Link Send Catch. Why: The person needs to know it didn't go out. How: This logs and explains it.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setAccErrStr( "The sign-in link couldn't be sent. Check the address, then try again." ); // What: Failure Message. Why: A mistyped address is the usual cause. How: This says so.



			return false; // What: Failed Return. Why: The screen must not claim a link went out. How: This reports the failure.


		}


	};



	const sigOutFun = async () => { // What: Sign Out Function. Why: A device can leave its account and keep its data. How: This signs out and forgets the sync record, so signing in again is a first sync.


		try { // What: Sign-Out Try. Why: The record belongs to the account being left. How: This signs out, forgets the record, and clears the status.


			await ( await staWatFun() ).sigOutFun(); // What: Sign-Out Call. Why: The session ends. How: This signs out.


			localStorage.removeItem( STG_NAM_OBJ.SYN_MET_STR ); // What: Record Forget. Why: Signing in again starts a first sync. How: This removes the record.
			setSynRawStr( null );                               // What: Status Clear. Why: Nothing syncs now. How: This clears the status.


		}

		catch ( errCatObj ) { // What: Sign-Out Catch. Why: The person needs to know they're still signed in. How: This logs and explains it.


			console.warn( errCatObj ); // What: Failure Log. Why: The cause stays visible to anyone debugging. How: This logs it.

			setAccErrStr( "Signing out didn't finish. Try again." ); // What: Failure Message. Why: Trying again usually works. How: This says so.


		}


	};

	// #endregion Account Actions



	const synStaStr : SynStaTyp = !accUseObj ? null : accUseObj.paiBoo ? synRawStr : 'unpaid'; // What: Sync Status String. Why: The status means nothing while signed out, and sync waits for a purchase. How: This derives it from the account and the last sync.



	return { // What: Account Sync Return. Why: The account screen shows and acts on all of it. How: This returns the account, the status, and the actions.


		accErrStr,                                                                      // What: Account Error String. Why: The screen shows the last failure. How: This passes it.
		accLoaBoo,                                                                      // What: Account Loading Boolean. Why: The screen waits for the account. How: This passes it.
		accUseObj,                                                                      // What: Account User Object. Why: The screen shows who is signed in. How: This passes it.
		buySynFun,                                                                      // What: Buy Sync Function. Why: The screen starts a purchase. How: This passes the action.
		choAccFun : () => void synRunRef.current( 'account' ),                          // What: Choose Account Function. Why: The person kept the account's data. How: This runs the first sync that way.
		choDevFun : () => void synRunRef.current( 'device' ),                           // What: Choose Device Function. Why: The person kept this device's data. How: This runs the first sync that way.
		finLinFun : ( emaAdrStr, linUrlStr ) => void finLinFun( emaAdrStr, linUrlStr ), // What: Finish Link Function. Why: The screen finishes a waiting or pasted link. How: This calls the finisher.
		linNeeBoo : !!linUrlStr && !accUseObj,                                          // What: Link Needs Boolean. Why: A waiting link needs an address only until someone is signed in. How: This is true while one waits.
		purPenBoo,                                                                      // What: Purchase Pending Boolean. Why: The screen shows the purchase finishing. How: This passes it.
		senLinFun,                                                                      // What: Send Link Function. Why: The screen sends links and confirms them. How: This passes the sender.
		sigGooFun : () => void sigGooFun(),                                             // What: Sign Google Function. Why: The screen signs in with Google. How: This calls it.
		sigOutFun : () => void sigOutFun(),                                             // What: Sign Out Function. Why: The screen signs out. How: This calls it.
		synBefFun,                                                                        // What: Sync Before Function. Why: Today brings the account's copy in before building a new day's list. How: This passes the wait.
		synNeeFun,                                                                        // What: Sync Needed Function. Why: Today waits for sync only when it applies. How: This passes the check.
		synLasNum,                                                                      // What: Sync Last Number. Why: The screen says when it last synced. How: This passes it.
		synNowFun : () => void synRunRef.current(),                                     // What: Sync Now Function. Why: The screen can sync at once. How: This runs one.
		synStaStr,                                                                      // What: Sync Status String. Why: The screen shows the status. How: This passes it.
		wipAccFun                                                    // What: Wipe Account Function. Why: The Settings reset signs out and may delete the cloud copy before wiping. How: This passes the action.


	};


}

// #endregion useSynRunFun

// #endregion Hooks



// #region Exports

export { type AccSynTyp, type SynStaTyp, useSynRunFun }; // What: Named Exports. Why: app.tsx runs sync through the hook, and the Settings tab types its account props. How: This exports them by name.

// #endregion Exports


