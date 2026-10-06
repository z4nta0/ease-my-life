


// #region Imports

import cssModObj from './group-header.module.css'; // What: CSS Module Object. Why: The group header and its merge banners are styled from their own module. How: This maps each class name in group-header.module.css to its hashed module class.
import React     from 'react';                     // What: React. Why: GroHeaCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom } from '../../ui/button.tsx';   // What: Button Base Component. Why: The merge confirmation's buttons are shared styled buttons. How: This renders its Merge and Cancel actions.
import { durMilFun } from '../../utils/rhythm.ts'; // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { IcoSvgCom } from '../../ui/icon.tsx';     // What: Icon Svg Component. Why: The header's Edit Mode grip and rename controls show small glyphs. How: This is rendered inside those controls.
import { LogChiCom } from './day-log.tsx';         // What: Log Chip Component. Why: Each group header toggles its own Day Log panel. How: This is rendered next to the done/total count.

// #endregion Imports



/**
 * group-header.tsx = Group Header
 *
 * @summary
 * One group's sticky header on the Today tab: its name (inline-editable in
 * Edit Mode), its done/total count and progress bar, its Day Log toggle, and
 * the merge confirmation and name error shown beneath it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type GhcProTyp = { donCouNum : number, ediModBoo : boolean, groNamStr : string, logOpeBoo? : boolean, merPenObj? : { from : string, to : string } | null, onCanMerFun? : () => void, onConMerFun? : () => void, onGriDowFun? : ( poiEveObj : React.PointerEvent< HTMLElement > ) => void, onRenGroFun? : ( newValStr : string ) => void, onTogLogFun? : () => void, totCouNum : number, valNamFun? : ( rawValStr : string ) => string | null }; // What: Group-Header-Component Props Type. Why: A group header shows its progress and, in Edit Mode, renames and reorders its group, while the Reminders header uses only the basics. How: This types GroHeaCom's props, with every rename, merge, reorder, and log prop optional.

// #region GroHeaCom

/**
 * GroHeaCom = Group Header Component
 *
 * @summary
 * Renders one group's own sticky header: its name (plain text, or an
 * inline-editable field/button while Edit Mode is on), its done/total
 * count, the dash-bar progress row, and (outside Edit Mode) its own Day
 * Log toggle chip. Also renders the group-merge confirm prompt and any
 * name-collision error banner beneath the header itself.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.donCouNum   - Done Count Number: How many of this group's own
 *                            rows are done.
 * @param props.ediModBoo   - Edit Mode Boolean: Whether Edit Mode is currently
 *                            on.
 * @param props.groNamStr   - Group Name String: The group's own current
 *                            display name.
 * @param props.logOpeBoo   - Log Open Boolean: Whether this group's own Day
 *                            Log panel is open.
 * @param props.merPenObj   - Merge Pending Object: A pending rename that would
 *                            merge into an existing group, or null.
 * @param props.onCanMerFun - On Cancel Merge Function: Cancels the pending
 *                            merge in merPenObj.
 * @param props.onConMerFun - On Confirm Merge Function: Confirms the pending
 *                            merge in merPenObj.
 * @param props.onGriDowFun - On Grip Down Function: Starts a group-reorder
 *                            drag from this header's own grip handle.
 * @param props.onRenGroFun - On Rename Group Function: Commits a typed rename
 *                            of this group.
 * @param props.onTogLogFun - On Toggle Log Function: Toggles this group's own
 *                            Day Log panel.
 * @param props.totCouNum   - Total Count Number: How many rows this group has
 *                            in total.
 * @param props.valNamFun   - Validate Name Function: Validates a typed rename,
 *                            returning an error string on collision or null
 *                            when it is fine.
 *
 * @returns This group's own header element, plus any merge-confirm or
 * name-error banner beneath it.
 *
 * @example
 * ```tsx
 * GroHeaCom({ donCouNum, ediModBoo, groNamStr, ... }) // => <GroHeaCom />
 * ```
 *
*/

function GroHeaCom ( { donCouNum, ediModBoo, groNamStr, logOpeBoo, merPenObj, onCanMerFun, onConMerFun, onGriDowFun, onRenGroFun, onTogLogFun, totCouNum, valNamFun } : GhcProTyp ) : React.JSX.Element {


	// #region Cascade Dash Animation

	const preDonRef = React.useRef( donCouNum ); // What: Previous Done Reference. Why: The effect below needs last render's own donCouNum to detect a genuine increase, not just react to any change. How: This starts at the initial donCouNum and is overwritten at the end of that same effect.

	const [ freIndNum, setFreIndNum ] = React.useState( -1 ); // What: Fresh Index Number And Setter. Why: The dash that JUST turned on needs a brief animated cue, keyed by its own index. How: This is set by the effect below and read by the dash-row map further down.


	React.useEffect( () => { // What: Cascade Dash Effect. Why: A group's own done count climbing needs to animate the specific dash that just turned on, not the whole row at once. How: This detects donCouNum rising past preDonRef's own last value, flags the newly-lit dash, then clears that flag shortly after.


		if ( donCouNum > preDonRef.current ) { // What: Done Increase Branch. Why: Only a genuine rise in donCouNum should trigger the cascade cue, never a drop (an uncheck) or a no-op re-render. How: This compares the fresh donCouNum against preDonRef's own remembered prior value.


			const curIndNum = donCouNum - 1; // What: Current Index Number. Why: The freshly-lit dash is always the one at this position. How: This is one less than the new donCouNum.


			setFreIndNum( curIndNum ); // What: Fresh Index Set. Why: The dash-row map below needs to know which single dash to flag as freshly lit. How: This publishes curIndNum into freIndNum.

			const freTimNum = setTimeout( () => setFreIndNum( ( curValNum ) => ( curValNum === curIndNum ? -1 : curValNum ) ), durMilFun( 'p04' ) ); // What: Fresh Timeout Number. Why: The fresh cue must clear itself once its dash sweep ends, but only if a newer cascade hasn't already claimed freIndNum in the meantime. How: This clears freIndNum back to -1 after the sweep's own p04 duration step, guarded so a stale timeout can't stomp a fresher one. // Duration Base Plus 4 ~= 486.1ms


			preDonRef.current = donCouNum; // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.



			return () => clearTimeout( freTimNum ); // What: Effect Cleanup Return. Why: A stale fresh-cue timeout must not fire after a newer effect run has already begun. How: This cancels freTimNum.


		}



		preDonRef.current = donCouNum; // What: Previous Done Update. Why: Even a non-increase (a drop, or a no-op re-render) still needs preDonRef to track the latest value for next time. How: This overwrites preDonRef with the current donCouNum.


	}, [ donCouNum ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when donCouNum itself changes. How: donCouNum is the exact value preDonRef is compared against.

	// #endregion Cascade Dash Animation



	// #region Inline Name Edit

	const [ ediOpeBoo, setEdiOpeBoo ] = React.useState( false );     // What: Editing Open Boolean And Setter. Why: Edit Mode only, this tracks whether the inline name field currently replaces the plain heading/rename button. How: This is toggled by staEdiFun and finCloFun below.
	const [ cloOutBoo, setCloOutBoo ] = React.useState( false );     // What: Closing Out Boolean And Setter. Why: Closing the inline field plays a brief out-animation before it actually unmounts. How: This is toggled true right before that animation, then false once it finishes.
	const [ draNamStr, setDraNamStr ] = React.useState( groNamStr ); // What: Draft Name String And Setter. Why: The inline field edits a local draft, never groNamStr directly, until it is explicitly committed. How: This starts at groNamStr and is freely typed into while ediOpeBoo is true.
	const [ namErrStr, setNamErrStr ] = React.useState( '' );        // What: Name Error String And Setter. Why: Only set when valNamFun rejects a commit (e.g. a Page Tours rename colliding with an existing group name), since it has nothing to merge into, unlike onRenGroFun, so it blocks instead of offering a merge. How: This keeps the field open, un-committed, until the user edits again or cancels.

	const namInpRef = React.useRef( null ); // What: Name Input Reference. Why: Opening the field needs to both focus and select its own text. How: This is attached to the input's own ref prop below.


	React.useEffect( () => { // What: Explicit Focus Effect. Why: autoFocus's own default scroll-into-view would fight a guided-tour spotlight already mid-positioning this same input, since the tour's own scroll-to-target math runs a tick later and sees this as a moving target. How: This focuses namInpRef with preventScroll instead of relying on autoFocus, then selects its text.


		if ( !ediOpeBoo || !namInpRef.current ) return; // What: Not Editing Guard. Why: There is nothing to focus while the field isn't even open. How: This bails out early unless both ediOpeBoo is true and namInpRef is attached.



		namInpRef.current.focus( { preventScroll : true } ); // What: Explicit Focus Call. Why: preventScroll avoids fighting a tour's own scroll positioning, unlike the input's own autoFocus attribute would. How: This focuses namInpRef's own current node without letting the browser auto-scroll to it.
		namInpRef.current.select();                          // What: Text Select Call. Why: Opening the field should offer the whole current name ready to overtype, not just a caret. How: This selects namInpRef's own current text content.


	}, [ ediOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when ediOpeBoo itself changes. How: ediOpeBoo is the exact transition this effect reacts to.

	React.useEffect( () => { if ( !ediModBoo ) setEdiOpeBoo( false ); }, [ ediModBoo ] ); // What: Edit Mode Exit Effect. Why: Leaving Edit Mode entirely must cancel any in-progress name edit. How: This forces ediOpeBoo back to false whenever ediModBoo itself goes false.


	const staEdiFun = () => { // What: Start Edit Function. Why: Opening the field should always begin from the real current name, with any stale error cleared. How: This resets draNamStr and namErrStr, then opens ediOpeBoo.


		setDraNamStr( groNamStr ); // What: Draft Name Reset. Why: The field must open on the group's real current name, not a stale earlier draft. How: This copies groNamStr into draNamStr.
		setNamErrStr( '' );        // What: Name Error Clear. Why: A leftover error from an earlier attempt must not greet a fresh edit. How: This empties namErrStr.
		setEdiOpeBoo( true );      // What: Editing Open. Why: The inline field itself now needs to replace the rename button. How: This flips ediOpeBoo to true.


	};



	// #region finCloFun

	/**
	 * finCloFun = Finish Close Function
	 *
	 * @summary
	 * Plays the out animation (groNamInp--closing) for its base duration step,
	 * then unmounts the field and, for a real change, commits the rename. Guarded
	 * so the blur that Enter triggers can't double-fire alongside an explicit
	 * commit/cancel already in flight.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param chaValBoo - Change Value Boolean: True for a real, validated change
	 *                    to commit, false for a cancel or a no-op close.
	 * @param newValStr - New Value String: The validated group name to commit,
	 *                    unused when chaValBoo is false.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * finCloFun(chaValBoo, newValStr) // => void
	 * ```
	 *
	*/

	const finCloFun = ( chaValBoo : boolean, newValStr? : string ) => { // What: Finish Close Function. Why: See the doc comment just above. How: This stages cloOutBoo, then after the out animation's base duration step closes ediOpeBoo and either commits newValStr or reverts draNamStr.


		setCloOutBoo( true ); // What: Closing Flag Set. Why: The field's own out-animation needs to start immediately. How: This flips cloOutBoo to true.

		setTimeout( () => { // What: Close Settle Timeout. Why: The field must stay mounted through its own out-animation before this actually closes it. How: This runs once that animation's own base duration step has passed.


			setEdiOpeBoo( false ); // What: Editing Close. Why: The field itself is done animating out and can now unmount. How: This flips ediOpeBoo back to false.
			setCloOutBoo( false ); // What: Closing Flag Clear. Why: The out-animation flag must not persist once the field is already gone. How: This flips cloOutBoo back to false.

			if ( chaValBoo ) onRenGroFun( newValStr ); // What: Commit Branch. Why: A real, confirmed change needs to actually rename the group. How: This calls onRenGroFun with newValStr.

			else setDraNamStr( groNamStr ); // What: Revert Branch. Why: A cancel, or a no-op commit, should leave the draft matching the real name again for next time. How: This resets draNamStr back to groNamStr.


		}, durMilFun( 'bas' ) ); // What: Close Settle Delay. Why: The field stays mounted through its out-animation first. How: This waits that animation's own base duration step. // Duration Base ~= 157.8ms


	};

	// #endregion finCloFun



	const comEdiFun = () => { // What: Commit Edit Function. Why: Both blur (Enter blurs the input) and an explicit commit path need this exact same validation-then-close sequence. How: This trims the draft, checks whether it actually changed, validates it, and either stages an error or finishes closing.


		if ( cloOutBoo ) return; // What: Already Closing Guard. Why: A commit already in flight must not be re-triggered by a second event (e.g. Enter's own blur firing after the click that started this). How: This bails out while cloOutBoo is already true.



		const newValStr = draNamStr.trim();                       // What: New Value String. Why: A typed name needs its surrounding whitespace trimmed before it is compared or saved. How: This trims draNamStr.
		const chaValBoo = !!newValStr && newValStr !== groNamStr; // What: Changed Value Boolean. Why: An empty or unchanged draft should just close quietly rather than commit anything. How: This is true only when newValStr is non-empty and differs from groNamStr.


		if ( chaValBoo && valNamFun ) { // What: Validation Branch. Why: A real change needs to be checked against valNamFun before committing, since a collision should block rather than merge (Page Tours has nothing to merge into). How: This runs valNamFun against newValStr only when there is an actual change to validate.


			const errMesStr = valNamFun( newValStr ); // What: Error Message String. Why: This is the actual collision message, or null when newValStr is fine. How: This calls valNamFun with newValStr.


			if ( errMesStr ) { // What: Collision Branch. Why: A collision must keep the field open, un-committed, rather than close it. How: This stages namErrStr and reclaims focus instead of falling through to finCloFun below.


				setNamErrStr( errMesStr );  // What: Name Error Stage. Why: The banner beneath the header needs this exact message to display. How: This publishes errMesStr into namErrStr.
				namInpRef.current?.focus(); // What: Focus Reclaim. Why: commit() runs from onBlur too (Enter blurs the input), so focus may already be gone; reclaiming it lets the user just keep typing to fix the collision. How: This focuses namInpRef's own current node, if it still exists.



				return; // What: Validation Return. Why: A collision must not fall through to finCloFun below. How: This exits comEdiFun immediately.


			}


		}



		finCloFun( chaValBoo, newValStr ); // What: Finish Close Call. Why: Either an unvalidated no-op close or a validated real change needs to run the same close sequence. How: This calls finCloFun with the values computed above.


	};


	const canEdiFun = () => { // What: Cancel Edit Function. Why: Escape should discard the draft and any staged error without committing anything. How: This clears namErrStr then calls finCloFun with chaValBoo false.


		if ( cloOutBoo ) return; // What: Already Closing Guard. Why: A close already in flight must not be started a second time. How: This bails out while cloOutBoo is already true.



		setNamErrStr( '' ); // What: Name Error Clear. Why: A cancelled edit must not leave its staged error behind. How: This empties namErrStr.
		finCloFun( false ); // What: Finish Close Call. Why: The field still needs its own out-animation and revert. How: This calls finCloFun with chaValBoo false, so nothing is committed.


	};

	// #endregion Inline Name Edit



	return (


		<React.Fragment>{ /* What: Group Header Fragment Element. Why: The header itself and its own merge/error banners are true siblings with no shared wrapper of their own. How: This groups the header, the merge-confirm banner, and the name-error banner without adding an extra DOM node. */ }


			<header className={ cssModObj.groHeaHea }>{ /* What: Group Header Header Element. Why: This is GroHeaCom's own root landmark, holding the name/count row and the progress dash row beneath it. How: This renders as a semantic <header>. */ }


				<div className={ cssModObj.heaLefDiv }>{ /* What: Header Left Div Element. Why: The name, count, and Day Log chip read as one left-aligned cluster. How: This wraps the grip (Edit Mode only), the name/rename control, the count, and the Day Log chip. */ }


					{ ediModBoo && ( // What: Grip Visibility Check. Why: The drag handle only makes sense while Edit Mode is on. How: This renders the grip span only while ediModBoo is true.


						<span
							className={ cssModObj.groGriSpa }

							data-element-name-hook='groGriSpa'

							draggable={ false }

							aria-label='Drag to reorder group'
							role='button'
							tabIndex={ 0 }

							onDragStart={ ( draEveObj ) => draEveObj.preventDefault() }
							onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
						>{ /* What: Group Grip Span Element. Why: This is the actual pointer-drag handle for reordering this group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


							<IcoSvgCom
								icoNamStr='griEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'griEle' icon at a fixed size. */ }


						</span>


					) }

					{ ediModBoo && ediOpeBoo ? ( // What: Editing Field Branch. Why: While Edit Mode is on AND the field is open, the group's own name renders as an editable input instead of plain text or the rename button. How: This renders the inline input, wired to draNamStr/comEdiFun/canEdiFun.


						<input
							ref={ namInpRef }

							className={` ${ cssModObj.groNamInp }   ${ cloOutBoo ? cssModObj.groNamInpClosing : '' } `}

							data-element-name-hook='groNamInp'
							data-name-invalid-active={ !!namErrStr || undefined } // What: Name Invalid Active Attribute. Why: A name that collides with another group gets a warm frame from its module. How: This sets the presence-only attribute while namErrStr holds an error and removes it otherwise.

							maxLength={ 30 }
							type='text'
							value={ draNamStr }

							aria-label='Group name'

							onBlur={ comEdiFun }
							onChange={ ( chaEveObj ) => { // What: Change Handler. Why: Typing both updates the draft and clears any staged collision error, since the user is now fixing it. How: This copies the input's value into draNamStr, then clears namErrStr if one is set.


								setDraNamStr( chaEveObj.target.value ); // What: Draft Name Update. Why: The field is controlled, so every keystroke must land in draNamStr. How: This copies the input's own current value.



								if ( namErrStr ) setNamErrStr( '' ); // What: Error Clear Check. Why: A collision error no longer applies once the user starts editing the name again. How: This clears namErrStr only when one is set.


							} }
							onKeyDown={ ( keyEveObj ) => { // What: Key Down Handler. Why: Enter should commit (via a blur) and Escape should cancel, mirroring every other inline editor in the app. How: This blurs the input on Enter and calls canEdiFun on Escape.


								if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); // What: Enter Branch. Why: Enter commits the rename, which happens through the input's own onBlur. How: This blurs the input, firing comEdiFun.

								else if ( keyEveObj.key === 'Escape' ) { // What: Escape Branch. Why: Escape cancels the rename. How: This stops the key's default behavior, then calls canEdiFun.


									keyEveObj.preventDefault(); // What: Default Prevention. Why: Escape must not also trigger any browser-level default (such as leaving a fullscreen view). How: This calls preventDefault on the key event.
									canEdiFun();                // What: Cancel Edit Call. Why: This is the actual cancel. How: This calls canEdiFun.


								}


							} }
						/> // What: Group Name Input Element. Why: This is the actual editable field for renaming this group. How: This is a plain, maxLength-capped text input, committed on blur/Enter and cancelled on Escape. Its data-element-name-hook is read by the page tours' own group-rename steps and help mode's Today catalog.


					) : ediModBoo ? ( // What: Rename Button Branch. Why: While Edit Mode is on but the field is closed, the name itself acts as a button that opens it. How: This renders a button showing groNamStr plus an edit glyph, wired to staEdiFun.


						<button
							className={ cssModObj.groNamBut }

							data-element-name-hook='groNamBut'

							type='button'

							aria-label={ `Rename group ${ groNamStr }` }

							onClick={ staEdiFun }
						>{ /* What: Group Rename Button Element. Why: This is the actual affordance that opens the inline name field above. How: This renders groNamStr plus a small edit glyph, calling staEdiFun on click. Its data-element-name-hook is read by the page tours' own group-rename steps and help mode's Today catalog. */ }


							{ groNamStr }

							<IcoSvgCom
								className={ cssModObj.penIcoSvg }

								icoNamStr='ediEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The rename button needs a recognizable edit-affordance glyph next to the name. How: This renders the 'ediEle' icon at a fixed size. */ }


						</button>


					) : ( // What: Plain Heading Branch. Why: Outside Edit Mode the group's own name is just a plain, non-interactive heading. How: This renders a bare <h2> showing groNamStr.


						<h2 className={ cssModObj.groNamHea }>{ groNamStr }</h2> // What: Group Name Heading Element. Why: This is the group's own plain, non-editable display name. How: This renders groNamStr directly.


					) }

					<span className={ cssModObj.groCouSpa }>{ /* What: Group Count Span Element. Why: The done/total pair reads as one small cluster next to the name. How: This wraps the done and "of total" spans below. */ }


						<span className={ cssModObj.groDonSpa }>{ donCouNum }</span>{ /* What: Group Done Span Element. Why: This is the group's own current done count. How: This renders donCouNum directly. */ }

						<span className={ cssModObj.groTotSpa }>of { totCouNum }</span>{ /* What: Group Of Span Element. Why: The done count alone is meaningless without the total it is out of. How: This renders the literal word "of" plus totCouNum. */ }


					</span>



					{ !ediModBoo && onTogLogFun && ( // What: Log Chip Check. Why: The chip only makes sense outside Edit Mode and only when a caller actually wired up onTogLogFun. How: This renders LogChiCom only while both conditions hold.


						<LogChiCom
							open={ logOpeBoo }

							onTogLogFun={ onTogLogFun }
						/> // What: Log Chip Component. Why: Outside Edit Mode, this group's own Day Log panel needs a visible toggle. How: This is passed logOpeBoo and onTogLogFun directly.


					) }


				</div>

				<div className={ cssModObj.groProDiv }>{ /* What: Group Progress Div Element. Why: The dash-bar row is its own visual band beneath the name/count row. How: This maps one dash per row in the group, flagging the done ones and whichever one just turned fresh. */ }


					{ [ ...Array( totCouNum ).keys() ].map( ( curIndNum ) => ( // What: Dash Row Map. Why: One dash is needed per row in this group, regardless of what data backs it. How: This maps every index from 0 to totCouNum - 1 (Array.keys yields the indices themselves) to one <i>.


						<i
							key={ curIndNum }

							className={` ${ cssModObj.proDasIta }   ${ curIndNum === freIndNum ? cssModObj.proDasItaFresh : '' } `}

							data-dash-done-active={ curIndNum < donCouNum || undefined } // What: Dash Done Active Attribute. Why: A done row's dash is filled by its module. How: This sets the presence-only attribute on every dash below donCouNum and removes it otherwise.
						/> // What: Progress Dash Element. Why: This is one single dash in the group's own progress bar. How: This marks itself with data-dash-done-active once its own index falls under donCouNum, and takes the module's proDasItaFresh class for exactly one tick when it is the dash freIndNum names.


					) ) }


				</div>


			</header>


			{ merPenObj && ( // What: Merge Confirm Visibility Check. Why: The merge-confirm banner only exists while a same-name rename is actually pending. How: This renders the banner only while merPenObj holds a value.


				<div className={ cssModObj.merConDiv }>{ /* What: Merge Confirm Div Element. Why: This is the confirm-before-merging prompt's own root. How: This renders the explanatory message plus its own Cancel/Merge actions. */ }


					<span className={ cssModObj.conMesSpa }>{ /* What: Confirm Message Span Element. Why: The user needs to understand exactly what merging will do before confirming it. How: This renders merPenObj's own to/from names inside the fixed explanatory copy. */ }


						A group named &ldquo;{ merPenObj.to }&rdquo; already exists. Merge
						&ldquo;{ merPenObj.from }&rdquo;&rsquo;s pickers into it? This can&rsquo;t be undone.


					</span>

					<div className={ cssModObj.conActDiv }>{ /* What: Delete Actions Div Element. Why: The Cancel/Merge actions read as one paired cluster. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							kinValStr='ghost'
							sizValStr='sm'

							onClick={ onCanMerFun }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the pending merge without changing anything. How: This calls onCanMerFun. */ }



						<ButBasCom
							kinValStr='primary'
							sizValStr='sm'

							onClick={ onConMerFun }
						>Merge</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed merge trigger. How: This calls onConMerFun. */ }


					</div>


				</div>


			) }


			{ ediOpeBoo && namErrStr && ( // What: Name Error Visibility Check. Why: The collision banner only exists while the field is open AND an error is actually staged. How: This renders the banner only while both conditions hold.


				<div className={ cssModObj.namConDiv }>{ /* What: Name Conflict Div Element. Why: A rename collision needs the same visual treatment as the merge-confirm banner above. How: This renders namErrStr as the banner's own message. */ }


					<span className={ cssModObj.conMesSpa }>{ namErrStr }</span>{ /* What: Confirm Message Span Element. Why: This is the actual collision message text. How: This renders namErrStr directly. */ }


				</div>


			) }


		</React.Fragment>


	);


}

// #endregion GroHeaCom

// #endregion Components



// #region Exports

export { GroHeaCom }; // What: Named Export. Why: The Today tab renders a header above every group. How: This exports GroHeaCom by name.

// #endregion Exports


