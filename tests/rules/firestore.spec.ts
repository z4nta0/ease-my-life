


// #region Imports

import { assertFails              } from '@firebase/rules-unit-testing'; // What: Assert Fails. Why: Forbidden reads and writes must be refused. How: This expects a request to be denied.
import { assertSucceeds           } from '@firebase/rules-unit-testing'; // What: Assert Succeeds. Why: An allowed request must go through. How: This expects it to succeed.
import { deleteDoc                } from 'firebase/firestore';           // What: Delete Doc. Why: Deletion rules are checked. How: This deletes a document.
import { doc                      } from 'firebase/firestore';           // What: Doc. Why: Every request names a document. How: This builds a reference.
import { getDoc                   } from 'firebase/firestore';           // What: Get Doc. Why: Read rules are checked. How: This reads a document.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'; // What: Initialize Test Environment. Why: The rules run in the local emulator. How: This connects to it with the project's rules.
import { readFileSync             } from 'node:fs';                      // What: Read File Sync. Why: The emulator is given the real rules file. How: This reads it.
import { setDoc                   } from 'firebase/firestore';           // What: Set Doc. Why: Write rules are checked. How: This writes a document.
import { setLogLevel              } from 'firebase/firestore';           // What: Set Log Level. Why: Every refusal a test expects would otherwise print as a warning. How: This silences the SDK's logging.
import { test                     } from '@playwright/test';             // What: Test. Why: Each rule is its own test. How: This declares them.


import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'; // What: Rules Test Environment. Why: Every test reads and writes through it. How: This types it.
import type { TokenOptions         } from '@firebase/rules-unit-testing'; // What: Token Options. Why: Each test account carries chosen token claims. How: This types them.

// #endregion Imports



/**
 * firestore.spec.ts = Firestore Rules Spec
 *
 * @summary
 * Checks firestore.rules in the local Firebase Emulator, which npm run
 * test:rules starts and stops around this suite. A paid account with a
 * verified email can create its manifest at revision 1, move it on one
 * revision at a time, and read and write its document versions. Anything
 * else is refused: a skipped or repeated revision, an unexpected field,
 * another account's copy, an unpaid or unverified account, or nobody signed
 * in. An unpaid account can still delete its own copy.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const MAN_ONE_OBJ = { docs : { core : '1a2b3c4d' }, prior : {}, rev : 1, savedAt : 1000, v : 1 }; // What: Manifest One Object. Why: Most tests start from an account's first manifest. How: This is a valid one at revision 1.
const PAI_TOK_OBJ = { email_verified : true, paid : true };                                       // What: Paid Token Object. Why: A paying account's token carries both claims. How: This is its claims.

// #endregion Constants



// #region Module State

let tesEnvObj : RulesTestEnvironment; // What: Test Environment Object. Why: Every test reaches the emulator through it. How: This is set before the first test.

// #endregion Module State



// #region Helpers

const accStoFun = ( uidValStr : string, tokClaObj : TokenOptions ) => tesEnvObj.authenticatedContext( uidValStr, tokClaObj ).firestore(); // What: Account Store Function. Why: Each test acts as a chosen account. How: This returns the database as that account, with those token claims.



const seeManFun = () => tesEnvObj.withSecurityRulesDisabled( ( cotAdmObj ) => setDoc( doc( cotAdmObj.firestore(), 'users/alice' ), MAN_ONE_OBJ ) ); // What: Seed Manifest Function. Why: Update and read tests need a manifest already there. How: This writes alice's first manifest with the rules switched off.

// #endregion Helpers



// #region Module Init

test.beforeAll( async () => { // What: Setup Hook. Why: The tests share one emulator connection. How: This connects with the real rules.


	setLogLevel( 'silent' ); // What: Log Silence Call. Why: The tests expect many refusals, and assertFails already checks each one. How: This stops the SDK printing them.


	tesEnvObj = await initializeTestEnvironment({ // What: Environment Assignment. Why: Every test reaches the emulator through it. How: This connects to the emulator's Firestore under the demo project.


		firestore : { host : '127.0.0.1', port : 8080, rules : readFileSync( 'firestore.rules', 'utf8' ) }, // What: Firestore Options. Why: The emulator has to check the real rules. How: This names its default address and reads the rules file.
		projectId : 'demo-ease-my-life'                                                                     // What: Project Identifier. Why: The demo project can never reach a real one. How: This names it, matching the app's emulator setting.


	});


} );



test.afterAll( () => tesEnvObj.cleanup() ); // What: Teardown Hook. Why: The connection should close with the suite. How: This cleans it up.



test.beforeEach( () => tesEnvObj.clearFirestore() ); // What: Reset Hook. Why: Each test starts from an empty database. How: This clears it.



test( 'a paid owner creates its manifest at revision 1 and moves it one revision at a time', async () => { // What: Manifest Revision Test. Why: The server has to enforce the sync's revision check. How: This creates, updates, and tries bad revisions.


	const aliStoObj = accStoFun( 'alice', PAI_TOK_OBJ ); // What: Alice Store Object. Why: Alice is a paid owner. How: This acts as her.


	await assertFails( setDoc( doc( aliStoObj, 'users/alice' ), { ...MAN_ONE_OBJ, rev : 2 } ) );    // What: Skipped First Revision. Why: A first manifest must be revision 1. How: This expects revision 2 refused.
	await assertSucceeds( setDoc( doc( aliStoObj, 'users/alice' ), MAN_ONE_OBJ ) );                 // What: First Revision. Why: A first upload starts at 1. How: This expects it allowed.
	await assertFails( setDoc( doc( aliStoObj, 'users/alice' ), MAN_ONE_OBJ ) );                    // What: Repeated Revision. Why: A commit has to move the revision on. How: This expects revision 1 again refused.
	await assertSucceeds( setDoc( doc( aliStoObj, 'users/alice' ), { ...MAN_ONE_OBJ, rev : 2 } ) ); // What: Next Revision. Why: Each commit moves one on. How: This expects revision 2 allowed.
	await assertFails( setDoc( doc( aliStoObj, 'users/alice' ), { ...MAN_ONE_OBJ, rev : 4 } ) );    // What: Skipped Revision. Why: A revision can't jump. How: This expects revision 4 refused.
	await assertSucceeds( getDoc( doc( aliStoObj, 'users/alice' ) ) );                              // What: Manifest Read. Why: The owner reads her manifest. How: This expects it allowed.


} );



test( 'a manifest or version with an unexpected field is refused', async () => { // What: Shape Test. Why: A malformed copy would break the next sync. How: This writes extra fields.


	const aliStoObj = accStoFun( 'alice', PAI_TOK_OBJ ); // What: Alice Store Object. Why: Alice is a paid owner. How: This acts as her.


	await assertFails( setDoc( doc( aliStoObj, 'users/alice' ), { ...MAN_ONE_OBJ, extra : true } ) );                 // What: Extra Manifest Field. Why: The manifest holds only the engine's fields. How: This expects an extra field refused.
	await assertFails( setDoc( doc( aliStoObj, 'users/alice/docs/core~1a2b3c4d' ), { text : '{}', extra : true } ) ); // What: Extra Version Field. Why: A version holds only its text. How: This expects an extra field refused.
	await assertFails( setDoc( doc( aliStoObj, 'users/alice/docs/core~1a2b3c4d' ), { text : 5 } ) );                  // What: Non-Text Version. Why: A version's text is a string. How: This expects a number refused.
	await assertSucceeds( setDoc( doc( aliStoObj, 'users/alice/docs/core~1a2b3c4d' ), { text : '{}' } ) );            // What: Valid Version. Why: A version is its JSON text. How: This expects it allowed.


} );



test( "nobody else, and no unpaid, unverified, or signed-out account, can read or write a copy", async () => { // What: Access Test. Why: A copy belongs to its paid owner alone. How: This tries every other kind of account.


	await seeManFun(); // What: Manifest Seed. Why: Reads need a copy to read. How: This writes alice's manifest.


	const bobStoObj = accStoFun( 'bob', PAI_TOK_OBJ );                               // What: Bob Store Object. Why: Bob is a paid stranger to alice's copy. How: This acts as him.
	const unpStoObj = accStoFun( 'alice', { email_verified : true } );               // What: Unpaid Store Object. Why: Alice before paying. How: This acts as her without the paid claim.
	const unvStoObj = accStoFun( 'alice', { email_verified : false, paid : true } ); // What: Unverified Store Object. Why: A paid claim on an unverified email. How: This acts as that account.
	const anoStoObj = tesEnvObj.unauthenticatedContext().firestore();                // What: Anonymous Store Object. Why: Nobody signed in. How: This acts as no account.


	for ( const curStoObj of [ bobStoObj, unpStoObj, unvStoObj, anoStoObj ] ) { // What: Refused Account Loop. Why: Each of these is refused the same way. How: This tries a read and both writes as each.


		await assertFails( getDoc( doc( curStoObj, 'users/alice' ) ) );                                     // What: Refused Read. Why: The copy isn't theirs to read. How: This expects the read refused.
		await assertFails( setDoc( doc( curStoObj, 'users/alice' ), { ...MAN_ONE_OBJ, rev : 2 } ) );        // What: Refused Manifest Write. Why: The copy isn't theirs to change. How: This expects the write refused.
		await assertFails( setDoc( doc( curStoObj, 'users/alice/docs/core~1a2b3c4d' ), { text : '{}' } ) ); // What: Refused Version Write. Why: The copy isn't theirs to change. How: This expects the write refused.


	}


} );



test( 'an unpaid owner can still delete its own copy, and a stranger cannot', async () => { // What: Delete Test. Why: Anyone can always remove their own data. How: This deletes as a stranger and as the unpaid owner.


	await seeManFun(); // What: Manifest Seed. Why: There has to be a copy to delete. How: This writes alice's manifest.



	await assertFails( deleteDoc( doc( accStoFun( 'bob', PAI_TOK_OBJ ), 'users/alice' ) ) );                    // What: Stranger Delete. Why: Bob can't delete alice's copy. How: This expects it refused.
	await assertSucceeds( deleteDoc( doc( accStoFun( 'alice', { email_verified : true } ), 'users/alice' ) ) ); // What: Owner Delete. Why: Alice can delete her own copy without paying. How: This expects it allowed.


} );

// #endregion Module Init


