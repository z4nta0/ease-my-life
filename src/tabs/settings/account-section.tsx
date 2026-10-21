


// #region Imports

import cssModObj from './account-section.module.css'; // What: CSS Module Object. Why: AccSecCom's own styles live in its module. How: Each className reads its class from this object.
import React     from 'react';                          // What: React. Why: The section keeps its own form state. How: This is used directly (React.useState).


import { ButBasCom   } from '../../ui/button.tsx';       // What: Button Base Component. Why: Every action here is a shared button. How: This renders them.
import { CarSurCom   } from '../../ui/card-surface.tsx'; // What: Card Surface Component. Why: The section's rows sit on a card like every other section's. How: This wraps them.
import { SYN_PRI_STR } from '../../constants.ts';        // What: Sync Price String. Why: The upgrade row names its price. How: This is the one-time price.


import type { AccSynTyp } from '../../state/sync-run.ts'; // What: Account Sync Type. Why: The section shows and acts on the account and its sync. How: This types its prop.

// #endregion Imports



/**
 * account-section.tsx = Account Section
 *
 * @summary
 * The Settings tab's Account section. Signed out, it offers Google sign-in
 * and an emailed sign-in link, with a box to paste the link into, since an
 * installed app on a phone often can't open a link itself (the email opens
 * it in the browser instead). A link opened where it wasn't requested asks
 * for the address it was sent to. Signed in, it names the account and offers
 * sign-out, then either the paid sync upgrade or, once bought, how sync is
 * going and a Sync now button. A device's first sync onto an account that
 * already holds data asks which copy to keep. Every result is announced:
 * failures through an alert region, and sign-in and sync news through a
 * status region, both in the page and empty from the first render.
 *
 * Sections:
 *  - Types
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type AscProTyp = { accSynObj : AccSynTyp }; // What: Account-Section-Component Props Type. Why: The section needs the account and its sync. How: This types AccSecCom's one prop.

// #endregion Types



// #region Helpers

// #region synTexFun

/**
 * synTexFun = Sync Text Function
 *
 * @summary
 * Turns the sync status into the sentence the section shows. Being offline
 * reads as normal, since changes stay safe on the device and sync later.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param accSynObj - Account Sync Object: {@link useSynRunFun}'s result.
 *
 * @returns The sentence.
 *
 * @example
 * ```ts
 * synTexFun(accSynObj) // => 'Synced at 3:42 PM.'
 * ```
 *
*/

function synTexFun ( accSynObj : AccSynTyp ) : string {


	const lasTimStr = accSynObj.synLasNum ? new Date( accSynObj.synLasNum ).toLocaleTimeString( [], { hour : 'numeric', minute : '2-digit' } ) : ''; // What: Last Time String. Why: A finished sync says when. How: This formats the last sync's time of day.



	if ( accSynObj.synStaStr === 'syncing' ) return 'Syncing…'; // What: Syncing Return. Why: A sync is running. How: This says so.



	if ( accSynObj.synStaStr === 'synced' ) return `Synced at ${ lasTimStr }.`; // What: Synced Return. Why: The last sync finished. How: This says when.



	if ( accSynObj.synStaStr === 'offline' ) return "You're offline. Changes are saved on this device and will sync when you're back online."; // What: Offline Return. Why: Being offline loses nothing. How: This reassures.



	if ( accSynObj.synStaStr === 'error' ) return "The last sync didn't finish. It will try again the next time something changes, or you can sync now."; // What: Error Return. Why: A failed sync retries. How: This explains when.



	if ( accSynObj.synStaStr === 'newer' ) return 'Your account was last synced by a newer version of Ease My Life. Reload the app to update it, and sync will continue.'; // What: Newer Return. Why: An older app can't merge a newer copy. How: This says how to update.



	return 'Waiting to sync.'; // What: Waiting Return. Why: Nothing has synced yet this session. How: This says so.


}

// #endregion synTexFun

// #endregion Helpers



// #region Components

// #region AccSecCom

/**
 * AccSecCom = Account Section Component
 *
 * @summary
 * Renders the Account section's intro, its card of rows for the current
 * account state (see the file summary), and its two announcement regions.
 * A row's text sits beside its control, or above it on a narrow screen.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.accSynObj - Account Sync Object: {@link useSynRunFun}'s
 *                          result.
 *
 * @returns The section's intro, card, and announcement regions.
 *
 * @example
 * ```tsx
 * AccSecCom({ accSynObj }) // => <AccSecCom />
 * ```
 *
*/

function AccSecCom ( { accSynObj } : AscProTyp ) : React.JSX.Element {


	const [ emaAdrStr, setEmaAdrStr ] = React.useState( '' ); // What: Email Address String And Setter. Why: The email field is controlled. How: This holds its text.
	const [ buyActBoo, setBuyActBoo ] = React.useState( false ); // What: Buy Active Boolean And Setter. Why: The Unlock button waits while the checkout opens. How: This is true from the click until the checkout opens or fails.
	const [ linSenStr, setLinSenStr ] = React.useState( '' ); // What: Link Sent String And Setter. Why: After sending, the section says where the link went. How: This holds that address.
	const [ pasUrlStr, setPasUrlStr ] = React.useState( '' ); // What: Pasted URL String And Setter. Why: The paste field is controlled. How: This holds its text.

	const accUseObj = accSynObj.accUseObj; // What: Account User Object. Why: Most rows depend on who is signed in. How: This reads the account.



	const senLinFun = ( subEveObj : React.FormEvent ) => { // What: Send Link Function. Why: The email form sends a sign-in link. How: This stops the page reload, sends the link, and remembers where it went once it's sent.


		subEveObj.preventDefault(); // What: Submit Prevent Call. Why: The form must not reload the page. How: This cancels the default submit.



		if ( !emaAdrStr.trim() ) return; // What: Empty Address Guard. Why: There's nowhere to send a link. How: This returns.



		const senAdrStr = emaAdrStr.trim(); // What: Sent Address String. Why: The confirmation names the address as sent, even if the field changes meanwhile. How: This keeps it.


		void accSynObj.senLinFun( senAdrStr ).then( ( senOkaBoo ) => { if ( senOkaBoo ) setLinSenStr( senAdrStr ); } ); // What: Link Send Call. Why: The section confirms only a link that went out. How: This sends it and keeps the address once it's sent.


	};



	const buySynFun = () => { // What: Buy Sync Function. Why: The Unlock button starts the purchase. How: This marks the button busy and starts the checkout, clearing the mark if it fails to open.


		setBuyActBoo( true ); // What: Busy Mark. Why: A second click mustn't open a second checkout. How: This disables the button.


		void accSynObj.buySynFun().finally( () => setBuyActBoo( false ) ); // What: Checkout Start Call. Why: The checkout opens on Polar's page, or fails with a message. How: This starts it and clears the mark once it settles.


	};



	const finPasFun = ( subEveObj : React.FormEvent ) => { // What: Finish Paste Function. Why: The paste form finishes a sign-in with a link copied from the email. How: This stops the page reload and finishes with the address typed above.


		subEveObj.preventDefault(); // What: Submit Prevent Call. Why: The form must not reload the page. How: This cancels the default submit.



		if ( pasUrlStr.trim() ) accSynObj.finLinFun( linSenStr || emaAdrStr, pasUrlStr.trim() ); // What: Paste Finish Call. Why: The pasted link signs in the address it was sent to. How: This finishes it.


	};



	const finNeeFun = ( subEveObj : React.FormEvent ) => { // What: Finish Needed Function. Why: A link opened where it wasn't requested needs its address. How: This stops the page reload and finishes with the typed address.


		subEveObj.preventDefault(); // What: Submit Prevent Call. Why: The form must not reload the page. How: This cancels the default submit.



		if ( emaAdrStr.trim() ) accSynObj.finLinFun( emaAdrStr ); // What: Needed Finish Call. Why: The waiting link signs in this address. How: This finishes it.


	};



	return (


		<>{ /* What: Account Section Fragment. Why: The intro, card, and regions sit directly in the section the Settings tab renders. How: This groups them without a wrapper. */ }


			<p className={ cssModObj.secSubPar }>Ease My Life runs entirely on this device, with no account needed. Sync across devices is a one-time purchase that keeps your data the same on every device you sign in to. Your theme and display settings stay separate on each device. Restoring from a backup file instead? Use Import in Data control, just above.</p>{ /* What: Section Sub Paragraph Element. Why: The section explains what an account is for before offering one. How: This states that accounts are optional and what sync does, and points a returning person without an account at Import. */ }



			<CarSurCom>{ /* What: Card Surface Component. Why: The account rows need the same bordered container as every other section's. How: This wraps whichever rows apply. */ }


				{ accSynObj.accLoaBoo && ( // What: Loading Check. Why: The account isn't known yet. How: This shows a waiting row.


					<div className={ cssModObj.setRowDiv }>{ /* What: Settings Row Div Element. Why: Loading takes the place of the account rows. How: This holds the loading text. */ }


						<span className={ cssModObj.setSubSpa }>Checking your account…</span>{ /* What: Settings Sub Span Element. Why: The wait should say what it's for. How: This names it. */ }


					</div>


				) }



				{ !accSynObj.accLoaBoo && !accUseObj && accSynObj.linNeeBoo && ( // What: Link Needs Address Check. Why: A link opened where it wasn't requested needs its address before anything else. How: This shows the finish form.


					<form
						className={ cssModObj.setRowDiv }

						data-element-name-hook='accFinFor'

						onSubmit={ finNeeFun }
					>{ /* What: Settings Row Form Element. Why: Finishing needs the address the link was sent to. How: This holds the address field and its button. */ }


						<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name, description, and field stack together. How: This wraps them. */ }


							<label
								className={ cssModObj.setNamLab }

								htmlFor='accFinInp'
							>Finish signing in</label>{ /* What: Settings Name Label Element. Why: The field needs a short name of its own. How: This names it. */ }

							<span
								id='accFinSpa'

								className={ cssModObj.setSubSpa }
							>Enter the email address the sign-in link was sent to.</span>{ /* What: Settings Sub Span Element. Why: The link alone doesn't say whose it is. How: This asks for the address, and describes the field. */ }


							<div className={ cssModObj.accFieDiv }>{ /* What: Account Field Div Element. Why: A field and its button belong on one line, so the button lines up with the field rather than with the whole row. How: This holds them side by side, wrapping the button under the field when there isn't room. */ }


								<input
									id='accFinInp'

									className={ cssModObj.accEmaInp }

									autoComplete='email'
									required
									type='email'
									value={ emaAdrStr }

									aria-describedby='accFinSpa'

									onChange={ ( chaEveObj ) => setEmaAdrStr( chaEveObj.target.value ) }
								/>{ /* What: Account Email Input Element. Why: The address finishes the sign-in. How: This holds it. */ }



								<ButBasCom
									kinValStr='primary'
									sizValStr='sm'
									type='submit'
								>Finish sign in</ButBasCom>{ /* What: Button Base Component. Why: The form needs its action. How: This submits it. */ }


							</div>


						</div>


					</form>


				) }



				{ !accSynObj.accLoaBoo && !accUseObj && ( // What: Signed Out Check. Why: Nobody is signed in. How: This shows both ways to sign in.


					<>{ /* What: Signed Out Fragment. Why: The Google row and the email form show together. How: This groups them. */ }


						<div className={ cssModObj.setRowDiv }>{ /* What: Settings Row Div Element. Why: Google sign-in sits in the tab's usual text-and-control row. How: This holds its text and button. */ }


							<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name and description stack together. How: This wraps them. */ }


								<span className={ cssModObj.setNamSpa }>Sign in</span>{ /* What: Settings Name Span Element. Why: The row names its job. How: This renders its name. */ }

								<span className={ cssModObj.setSubSpa }>Use your Google account, or get a sign-in link by email below. Signing in on its own changes nothing on this device.</span>{ /* What: Settings Sub Span Element. Why: Someone deciding whether to sign in should know it's harmless. How: This says so. */ }


							</div>



							<ButBasCom
								data-element-name-hook='accGooBut'

								kinValStr='secondary'
								sizValStr='sm'

								onClick={ accSynObj.sigGooFun }
							>Sign in with Google</ButBasCom>{ /* What: Button Base Component. Why: Google is one way in. How: This opens Google's sign-in window. */ }


						</div>


						{ !accSynObj.linNeeBoo && ( // What: Link Form Check. Why: While a link waits for its address, its own form asks for it, and a second address field would confuse. How: This shows the email form otherwise.


							<form
								className={ cssModObj.setRowDiv }

								data-element-name-hook='accLinFor'

								onSubmit={ senLinFun }
							>{ /* What: Settings Row Form Element. Why: An emailed link is the other way in. How: This holds the address field and its button. */ }


								<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name, description, and field stack together. How: This wraps them. */ }


									<label
										className={ cssModObj.setNamLab }

										htmlFor='accEmaInp'
									>Email address</label>{ /* What: Settings Name Label Element. Why: The field needs a short name of its own. How: This names it. */ }

									<span
										key={ linSenStr }

										id='accEmaSpa'

										className={` ${ cssModObj.setSubSpa }   ${ cssModObj.setSubSpaFade } `}
									>{ linSenStr ? `A sign-in link is on its way to ${ linSenStr }. Open it on this device to finish.` : "We'll email you a link that signs you in, with no password to remember." }</span>{ /* What: Settings Sub Span Element. Why: The row explains the link before sending it and where it went after. How: This picks its sentence by whether a link was sent, and describes the field. */ }


									<div className={ cssModObj.accFieDiv }>{ /* What: Account Field Div Element. Why: A field and its button belong on one line, so the button lines up with the field rather than with the whole row. How: This holds them side by side, wrapping the button under the field when there isn't room. */ }


										<input
											id='accEmaInp'

											className={ cssModObj.accEmaInp }

											data-element-name-hook='accEmaInp'

											autoComplete='email'
											required
											type='email'
											value={ emaAdrStr }

											aria-describedby='accEmaSpa'

											onChange={ ( chaEveObj ) => setEmaAdrStr( chaEveObj.target.value ) }
										/>{ /* What: Account Email Input Element. Why: The link needs an address. How: This holds it. */ }



										<ButBasCom
											kinValStr='secondary'
											sizValStr='sm'
											type='submit'
										>{ linSenStr ? 'Send another link' : 'Email me a link' }</ButBasCom>{ /* What: Button Base Component. Why: The form needs its action, which can resend. How: This submits it, its label saying whether a link already went. */ }


									</div>


								</div>


							</form>


						) }


						{ linSenStr && ( // What: Link Sent Check. Why: A phone's installed app often can't open the link itself. How: This offers a box to paste it into.


							<form
								className={ cssModObj.setRowDiv }

								data-element-name-hook='accPasFor'

								onSubmit={ finPasFun }
							>{ /* What: Settings Row Form Element. Why: A copied link can finish the sign-in here. How: This holds the paste field and its button. */ }


								<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name, description, and field stack together. How: This wraps them. */ }


									<label
										className={ cssModObj.setNamLab }

										htmlFor='accPasInp'
									>Paste the link</label>{ /* What: Settings Name Label Element. Why: The field needs a short name of its own. How: This names it. */ }

									<span
										id='accPasSpa'

										className={ cssModObj.setSubSpa }
									>Using the installed app? If the link opened in your browser instead, copy that page's address and paste it here.</span>{ /* What: Settings Sub Span Element. Why: The link opening elsewhere is the usual snag on a phone. How: This explains the workaround, and describes the field. */ }


									<div className={ cssModObj.accFieDiv }>{ /* What: Account Field Div Element. Why: A field and its button belong on one line, so the button lines up with the field rather than with the whole row. How: This holds them side by side, wrapping the button under the field when there isn't room. */ }


										<input
											id='accPasInp'

											className={ cssModObj.accEmaInp }

											data-element-name-hook='accPasInp'

											required
											type='url'
											value={ pasUrlStr }

											aria-describedby='accPasSpa'

											onChange={ ( chaEveObj ) => setPasUrlStr( chaEveObj.target.value ) }
										/>{ /* What: Account Email Input Element. Why: The pasted link holds the sign-in code. How: This holds it. */ }



										<ButBasCom
											kinValStr='secondary'
											sizValStr='sm'
											type='submit'
										>Finish sign in</ButBasCom>{ /* What: Button Base Component. Why: The form needs its action. How: This submits it. */ }


									</div>


								</div>


							</form>


						) }


					</>


				) }



				{ accUseObj && ( // What: Signed In Check. Why: An account is signed in. How: This shows it, then the upgrade or the sync rows.


					<>{ /* What: Signed In Fragment. Why: The account row and the sync rows show together. How: This groups them. */ }


						<div className={ cssModObj.setRowDiv }>{ /* What: Settings Row Div Element. Why: The account sits in the tab's usual text-and-control row. How: This holds its text and the sign-out button. */ }


							<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name and description stack together. How: This wraps them. */ }


								<span className={ cssModObj.setNamSpa }>Signed in</span>{ /* What: Settings Name Span Element. Why: The row says who is signed in. How: This renders its name. */ }

								<span className={ cssModObj.setSubSpa }>{ accUseObj.emaStr || 'Your account' }. Signing out keeps everything on this device.</span>{ /* What: Settings Sub Span Element. Why: Signing out should feel safe. How: This names the account and says nothing is lost. */ }


							</div>



							<ButBasCom
								data-element-name-hook='accOutBut'

								kinValStr='secondary'
								sizValStr='sm'

								onClick={ accSynObj.sigOutFun }
							>Sign out</ButBasCom>{ /* What: Button Base Component. Why: A device can leave its account. How: This signs out. */ }


						</div>


						{ accSynObj.synStaStr === 'unpaid' && ( // What: Unpaid Check. Why: Sync waits for its purchase. How: This shows the upgrade row.


							<div className={ cssModObj.setRowDiv }>{ /* What: Settings Row Div Element. Why: The upgrade sits in the tab's usual text-and-control row. How: This holds its text and button. */ }


								<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name and description stack together. How: This wraps them. */ }


									<span className={ cssModObj.setNamSpa }>Sync across devices</span>{ /* What: Settings Name Span Element. Why: The row names the upgrade. How: This renders its name. */ }

									<span
										key={ String( accSynObj.purPenBoo ) }

										className={` ${ cssModObj.setSubSpa }   ${ cssModObj.setSubSpaFade } `}
									>{ accSynObj.purPenBoo ? 'Finishing your purchase. This usually takes a few seconds.' : `A one-time purchase of ${ SYN_PRI_STR }, not a subscription. Once it's unlocked, this account keeps your data the same on every device you sign in to.` }</span>{ /* What: Settings Sub Span Element. Why: The price model matters to the decision, and a returning buyer should know the unlock is on its way. How: This states the price and model, or the wait, fading between them. */ }


								</div>



								<ButBasCom
									data-element-name-hook='accBuyBut'

									disabled={ buyActBoo || accSynObj.purPenBoo }
									kinValStr='primary'
									sizValStr='sm'

									onClick={ buySynFun }
								>{ buyActBoo ? 'Opening checkout…' : 'Unlock sync' }</ButBasCom>{ /* What: Button Base Component. Why: This starts the purchase. How: This opens Polar's checkout, disabled and relabeled while it opens or while a purchase finishes. */ }


							</div>


						) }


						{ accSynObj.synStaStr === 'choose' && ( // What: Choice Check. Why: A first sync onto an account that has data needs the person's choice. How: This shows the two options.


							<div className={` ${ cssModObj.setRowDiv }   ${ cssModObj.setRowDivStack } `}>{ /* What: Settings Row Div Element. Why: The choice needs room to explain both options. How: This stacks the text above the two buttons. */ }


								<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name and description stack together. How: This wraps them. */ }


									<span className={ cssModObj.setNamSpa }>Which data should this account keep?</span>{ /* What: Settings Name Span Element. Why: The row asks its question. How: This renders it. */ }

									<span className={ cssModObj.setSubSpa }>Your account already holds data from another device, and this device has its own. Keeping the account's data replaces this device's pickers and reminders, though its past history is kept. Keeping this device's data replaces the account's copy on every device.</span>{ /* What: Settings Sub Span Element. Why: Either choice replaces something, so each consequence is spelled out. How: This explains both. */ }


								</div>



								<div className={ cssModObj.accChoDiv }>{ /* What: Account Choice Div Element. Why: The two choices sit side by side, wrapping onto two lines on a narrow screen. How: This holds both buttons. */ }


									<ButBasCom
										data-element-name-hook='accChoBut'

										kinValStr='primary'
										sizValStr='sm'

										onClick={ accSynObj.choAccFun }
									>Keep the account's data</ButBasCom>{ /* What: Button Base Component. Why: The account's data is usually the one to keep. How: This runs the first sync keeping it. */ }



									<ButBasCom
										data-element-name-hook='accDevBut'

										kinValStr='secondary'
										sizValStr='sm'

										onClick={ accSynObj.choDevFun }
									>Keep this device's data</ButBasCom>{ /* What: Button Base Component. Why: This device's data may be the newer one. How: This runs the first sync keeping it. */ }


								</div>


							</div>


						) }


						{ accUseObj.paiBoo && accSynObj.synStaStr !== 'choose' && ( // What: Sync Status Check. Why: A paid account shows how sync is going. How: This shows the status row.


							<div className={ cssModObj.setRowDiv }>{ /* What: Settings Row Div Element. Why: The status sits in the tab's usual text-and-control row. How: This holds its text and the Sync now button. */ }


								<div className={ cssModObj.setInfDiv }>{ /* What: Settings Info Div Element. Why: The row's name and description stack together. How: This wraps them. */ }


									<span className={ cssModObj.setNamSpa }>Sync</span>{ /* What: Settings Name Span Element. Why: The row names its job. How: This renders its name. */ }

									<span
										key={ accSynObj.synStaStr }

										className={` ${ cssModObj.setSubSpa }   ${ cssModObj.setSubSpaFade } `}

										data-element-name-hook='accStaSpa'
									>{ synTexFun( accSynObj ) }</span>{ /* What: Settings Sub Span Element. Why: The status explains itself, fading in each new one. How: This renders the status sentence, keyed by the status so a change remounts it. */ }


								</div>



								<ButBasCom
									data-element-name-hook='accNowBut'

									disabled={ accSynObj.synStaStr === 'syncing' }
									kinValStr='secondary'
									sizValStr='sm'

									onClick={ accSynObj.synNowFun }
								>Sync now</ButBasCom>{ /* What: Button Base Component. Why: Someone may not want to wait. How: This syncs at once, disabled while a sync runs. */ }


							</div>


						) }


					</>


				) }


			</CarSurCom>



			<p
				className={ cssModObj.accErrPar }

				data-element-name-hook='accErrPar'

				role='alert'
			>{ accSynObj.accErrStr && <span key={ accSynObj.accErrStr } className={ cssModObj.accErrSpa }>{ accSynObj.accErrStr }</span> }</p>{ /* What: Account Error Paragraph Element. Why: A failed sign-in or sync has to reach screen readers too. How: This alert region is in the page and empty from the first render, gaining the failure's sentence in a span keyed by it, so each new failure pops in. */ }

			<p
				className={ cssModObj.accStaPar }

				data-element-name-hook='accStaPar'

				role='status'
			>{ accSynObj.purPenBoo ? 'Finishing your purchase.' : accUseObj ? `Signed in as ${ accUseObj.emaStr || 'your account' }.` : linSenStr ? `Sign-in link sent to ${ linSenStr }.` : '' }</p>{ /* What: Account Status Paragraph Element. Why: Signing in and sending a link change the section without moving focus, so screen readers need to hear it. How: This visually hidden status region is in the page and empty from the first render, gaining each result's sentence, the purchase finishing included. */ }


		</>


	);


}

// #endregion AccSecCom

// #endregion Components



// #region Exports

export { AccSecCom }; // What: Named Export. Why: The Settings tab renders the Account section through it. How: This exports AccSecCom by name.

// #endregion Exports


