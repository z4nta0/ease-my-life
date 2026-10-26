


// #region Imports

import cssModObj from './legal-docs.module.css'; // What: CSS Module Object. Why: The legal modal's backdrop, panel, head, and body styles live in its own module. How: This maps each class name in legal-docs.module.css to its hashed module class.
import React     from 'react';                   // What: React. Why: LegModCom is a React component. How: This is used directly (React.useRef, React.useState, React.useEffect) throughout, instead of importing individual named hooks.


import { createPortal } from 'react-dom';               // What: Create Portal. Why: The modal must render into <body> so help mode's overlay and any ancestor's stacking can't bury it. How: This is called by LegModCom's own return.
import { durMilFun    } from '../../utils/rhythm.ts';   // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { IcoSvgCom    } from '../../ui/icon.tsx';       // What: Icon Svg Component. Why: The modal's own close button needs a recognizable glyph. How: This is rendered inside LegModCom's close button with the name 'x'.
import { PriPolCom    } from './legal-text.tsx';        // What: Privacy Policy Component. Why: The modal shows the Privacy Policy's own text. How: This renders inside the panel's body when legDocStr is 'privacy'.
import { redMotFun    } from '../../utils/motion.ts';   // What: Reduce Motion Function. Why: A user who prefers reduced motion should dismiss the modal instantly instead of playing its own closing animation. How: This is checked inside LegModCom's modDisFun to skip the animated delay.
import { TerSerCom    } from './legal-text.tsx';        // What: Terms Service Component. Why: The modal shows the Terms of Service's own text. How: This renders inside the panel's body when legDocStr is 'terms'.
import { useModIneFun } from '../../ui/modal-inert.ts'; // What: Use Modal Inert Function. Why: Tab must not leave the open panel for the page behind it. How: This is called with the panel's ref, making everything outside the modal inert while it's open.

// #endregion Imports



/**
 * legal-docs.tsx = Legal Documents
 *
 * @summary
 * The Settings modal that shows a legal document (Privacy Policy or Terms
 * of Service). LegModCom is the shell: backdrop plus centered scrollable
 * panel, dismissible via Esc, a backdrop click, or the close button, with
 * focus moved into the panel on open and an animated close (skipped for a
 * user who prefers reduced motion). The documents' own text lives in
 * legal-text.tsx, which the standalone legal pages render too.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type LmcProTyp = { legDocStr : 'privacy' | 'terms' | null, onCloModFun : () => void }; // What: Legal-Modal-Component Props Type. Why: The modal shows one legal document, or nothing, and reports when it has closed. How: This types LegModCom's props.

// #region LegModCom

/**
 * LegModCom = Legal Modal Component
 *
 * @summary
 * The shared shell shown for both legal documents (Privacy Policy and
 * Terms of Service): a backdrop plus a centered, scrollable panel,
 * dismissible via Esc, a backdrop click, or the close button, with
 * focus moved into the panel on open and an animated close (skipped
 * outright for a user who prefers reduced motion). Background scroll
 * is locked to whatever offset the app's own <main> scroller was
 * showing at open time and restored to that exact offset on close.
 * It renders into <body> through a portal, above help mode, and its own
 * Escape runs first and is marked handled, so help mode stays on.
 * Renders nothing at all while legDocStr is null.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.legDocStr   - Legal Document String: Which document to show, or
 *                            null to render nothing.
 * @param props.onCloModFun - On Close Modal Function: Called once the close
 *                            animation (or the instant reduced-motion path)
 *                            finishes.
 *
 * @returns The modal's own backdrop-and-panel markup, portaled into <body>,
 * or null while legDocStr is null.
 *
 * @example
 * ```tsx
 * LegModCom({ legDocStr, onCloModFun }) // => <LegModCom />
 * ```
 *
*/

function LegModCom ( { legDocStr, onCloModFun } : LmcProTyp ) : React.ReactPortal | null {


	const panEleRef                   = React.useRef< HTMLDivElement | null >( null ); // What: Panel Element Reference. Why: This gives the effect below a handle on the panel so it can be focused on open. How: This is attached via the panel div's ref prop and read inside the open/close effect.
	const [ modCloBoo, setModCloBoo ] = React.useState( false );                       // What: Modal Closing Boolean And Setter. Why: This flags the closing-animation window so the backdrop/panel can swap to their own --closing modifier classes. How: This is set true by modDisFun and read in both className expressions below.


	// #region modDisFun

	/**
	 * modDisFun = Modal Dismiss Function
	 *
	 * @summary
	 * The single dismissal path shared by Esc, a backdrop press, and the
	 * close button. It calls onCloModFun right away for a user who prefers
	 * reduced motion; otherwise it flips modCloBoo so the backdrop and
	 * panel play their closing animation, and only calls onCloModFun once
	 * that animation has finished.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * modDisFun() // => void
	 * ```
	 *
	*/

	const modDisFun = () => { // What: Modal Dismiss Function. Why: Every dismissal path (Esc, backdrop click, close button) needs the same reduced-motion check and the same delayed onCloModFun. How: This calls onCloModFun immediately when reduced motion is preferred, otherwise plays the closing animation for 200ms first.


		if ( redMotFun() ) { onCloModFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should not see the closing animation at all. How: This calls onCloModFun immediately and skips the animated path below.



		setModCloBoo( true ); // What: Closing State Start Call. Why: This flips both the backdrop and panel into their own --closing modifier classes. How: This is read by the className expressions on the backdrop and panel divs below.



		setTimeout( () => { // What: Delayed Close Call. Why: onCloModFun must not fire until the closing animation has actually finished playing. How: This waits out the close animations' own p01 duration step before resetting modCloBoo and calling onCloModFun.


			setModCloBoo( false ); // What: Closing State Clear Call. Why: The next open should not inherit this close's own --closing modifiers. How: This resets modCloBoo back to its default false value.

			onCloModFun(); // What: Deferred Close Call. Why: The caller needs to actually clear legDocStr once the closing animation has finished playing. How: This calls the onCloModFun prop passed in from LegModCom's own caller.


		}, durMilFun( 'p01' ) ); // What: Close Animation Delay. Why: onCloModFun must wait for the closing animation. How: This reads the close animations' own p01 duration step, so the timer ends with them. // Duration Base Plus 1 ~= 209.1ms


	};

	// #endregion modDisFun



	React.useEffect( () => { // What: Open State Effect. Why: Every time legDocStr changes to a real value, the modal needs its own Esc listener, its own scroll lock, and its own initial focus, all torn back down on close. How: This subscribes a keydown listener, freezes the app's own main scroller, focuses the panel, and returns a cleanup that reverses all three.


		if ( !legDocStr ) return; // What: No Document Guard. Why: There is nothing to set up while no document is being shown. How: This bails out of the effect entirely when legDocStr is null.



		setModCloBoo( false ); // What: Closing Reset Call. Why: A fresh open should never start mid-closing-animation. How: This clears any stale true value left over from a previous close.



		const onKeyEscFun = ( keyEveObj : KeyboardEvent ) => { // What: On Key Escape Function. Why: Esc must dismiss the modal from anywhere on the page while it is open, and only the modal, not help mode underneath it. How: This dismisses the modal on Escape and marks the key handled.


			if ( keyEveObj.key !== 'Escape' ) return; // What: Non Escape Guard. Why: Only Escape dismisses the modal. How: This ignores every other key.



			keyEveObj.preventDefault(); // What: Handled Mark Call. Why: Help mode and the inline editors skip an Escape something else already handled, so closing the modal leaves them alone. How: This prevents the key's default action.

			modDisFun(); // What: Dismiss Call. Why: This is the actual close. How: This calls modDisFun.


		};


		document.addEventListener( 'keydown', onKeyEscFun, true ); // What: Escape Key Subscribe Call. Why: onKeyEscFun must run for as long as the modal is open, ahead of help mode's own document listener. How: This registers onKeyEscFun in the capture phase, which runs before any listener added in the bubble phase.



		const maiScrEle = document.querySelector< HTMLElement >( '[data-element-name-hook~="appConMai"]' ); // What: Main Scroll Element. Why: The app scrolls inside this element, not the document body, so this is what actually needs locking. How: This is queried once and reused for both the lock below and the cleanup's own restore.
		const scrTopNum = maiScrEle ? maiScrEle.scrollTop : 0;                                              // What: Scroll Top Number. Why: The scroller's exact offset at open time must be restored on close, even past the panel's own top/bottom. How: This is read once here and reused in the cleanup's own restore below.
		const preOveStr = maiScrEle ? maiScrEle.style.overflow : '';                                        // What: Previous Overflow String. Why: The scroller's own prior inline overflow value must be restored exactly, not just cleared. How: This is read once here and reused in the cleanup's own restore below.


		if ( maiScrEle ) maiScrEle.style.overflow = 'hidden'; // What: Scroll Lock Guard. Why: Nothing behind the modal should scroll while it is open. How: This sets the scroller's own inline overflow to hidden, only when the scroller actually exists.



		const focDelTim = setTimeout( () => { if ( panEleRef.current ) panEleRef.current.focus(); }, 20 ); // What: Focus Delay Timeout. Why: Moving focus into the panel lets Esc and scroll work immediately, but must wait one tick for the panel to actually be mounted. How: This focuses panEleRef's current element after 20ms, guarded so it no-ops if the ref is not attached yet.



		return () => { // What: Effect Cleanup Function. Why: None of the Esc listener, the scroll lock, or the pending focus timeout may outlive this effect run. How: This removes the keydown listener, clears the focus timeout, and restores the scroller's own prior overflow and offset.


			document.removeEventListener( 'keydown', onKeyEscFun, true ); // What: Escape Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onKeyEscFun reference that was registered.


			clearTimeout( focDelTim ); // What: Focus Timeout Teardown. Why: A pending focus call must not fire after this effect has already cleaned up. How: This cancels focDelTim, matching the setTimeout above.


			if ( maiScrEle ) { // What: Scroll Restore Guard. Why: The scroller must end up exactly as it was before this modal opened, but only when the scroller actually existed to lock in the first place. How: This wraps the two restore writes below in a single existence check.


				maiScrEle.style.overflow = preOveStr; // What: Overflow Restore Call. Why: The scroller's own inline overflow must go back to whatever it was before this modal locked it. How: This writes preOveStr back onto the scroller's own style.
				maiScrEle.scrollTop      = scrTopNum; // What: Scroll Position Restore Call. Why: The scroller must end up at the exact same offset it was showing before this modal opened. How: This writes scrTopNum back onto the scroller's own scrollTop.


			}


		};


	// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: modDisFun is recreated every render, and listing it would re-lock the scroller and re-move focus each time. How: The open-time copy stays correct, since it only calls the parent's close handler, which just clears the open document.
	}, [ legDocStr ] ); // What: Effect Dependency Array. Why: This effect must re-run every time a different document (or no document) is requested. How: legDocStr changes both whether the modal is shown at all and which document's own title/body renders inside it.



	useModIneFun( panEleRef, !!legDocStr ); // What: Modal Inert Call. Why: Tab must stay inside the open panel instead of reaching the page behind it. How: This makes everything outside the modal inert while a document is showing.



	if ( !legDocStr ) return null; // What: No Document Render Guard. Why: LegModCom renders nothing at all until a document is actually requested. How: This returns null before any of the JSX below runs.



	const modTitStr = legDocStr === 'privacy' ? 'Privacy Policy' : 'Terms of Service'; // What: Modal Title String. Why: The same title is needed for both the visible heading and the dialog's own aria-label. How: This is computed once from legDocStr and read in both places below.



	return createPortal( // What: Portal Return. Why: The modal must render into <body>, outside the Settings tab's own subtree, so no ancestor's transform or stacking context can shrink it or bury it under help mode's highlights. How: This portals the backdrop and its panel into document.body.


		<div
			className={` ${ cssModObj.legBacDiv }   ${ modCloBoo ? cssModObj.legBacDivClosing : '' } `}

			data-element-name-hook='legBacDiv'

			onMouseDown={ ( mouDowObj ) => { if ( mouDowObj.target === mouDowObj.currentTarget ) modDisFun(); } } // What: Backdrop Dismiss Handler. Why: Only a press on the scrim itself, not one inside the panel, should close the modal. How: This calls modDisFun only when the mousedown target is the backdrop element.
		>{ /* What: Container Backdrop Div Element. Why: This is the modal's own full-viewport scrim, and a direct click on it (not on the panel inside it) should dismiss the modal. How: This wraps the panel below and calls modDisFun only when the mousedown target is the backdrop itself. Its data-element-name-hook is read by help mode, which lets clicks inside the modal through. */ }


			<div
				ref={ panEleRef }

				className={` ${ cssModObj.legPanDiv }   ${ modCloBoo ? cssModObj.legPanDivClosing : '' } `}

				aria-label={ modTitStr }
				aria-modal='true'
				role='dialog'
				tabIndex={ -1 }
			>{ /* What: Container Panel Div Element. Why: This is the actual visible, scrollable, focusable dialog panel. How: This is focused on open via panEleRef and swaps to its own --closing modifier class while modCloBoo is true. */ }


				<div className={ cssModObj.panHeaDiv }>{ /* What: Container Head Div Element. Why: This groups the panel's own title and close button on one row. How: This renders the title span followed by the close button below. */ }


					<span className={ cssModObj.panTitSpa }>{ modTitStr }</span>{ /* What: Title Note Span Element. Why: This shows which document (Privacy Policy or Terms of Service) is currently open. How: This renders modTitStr as the panel's own visible heading text. */ }

					<button
						className={ cssModObj.panCloBut }

						type='button'

						aria-label='Close'

						onClick={ modDisFun }
					>{ /* What: Close Action Button Element. Why: A user must always have an explicit, visible way to dismiss the modal. How: This calls modDisFun when clicked. */ }


						<IcoSvgCom
							icoNamStr='croEle'
							sizSteStr='p01' // Vertical Rhythm Base Plus 1 ~= 19.304px
						/>{ /* What: Icon Svg Component. Why: The close button needs a recognizable "x" glyph rather than just its own aria-label text. How: This renders the shared IcoSvgCom component at the p01 rhythm step. */ }


					</button>


				</div>

				<div className={ cssModObj.panBodDiv }>{ /* What: Container Body Div Element. Why: This is the actual scrollable area the chosen document's own body renders into. How: This renders PriPolCom or TerSerCom below, chosen by legDocStr. */ }


					{ legDocStr === 'privacy' ? <PriPolCom /> : <TerSerCom /> }{ /* What: Document Choice Expression. Why: Only one of the two documents is ever shown at a time. How: This renders PriPolCom while legDocStr is 'privacy', otherwise TerSerCom. */ }


				</div>


			</div>


		</div>,

		document.body // What: Document Body Target. Why: The modal must sit at the top level of the page, above help mode's own portaled overlay. How: This is createPortal's own container argument.

	);


}

// #endregion LegModCom

// #endregion Components



// #region Exports

export { LegModCom }; // What: Named Export. Why: tab-settings.tsx renders this modal from its Legal section. How: This exports LegModCom by name.

// #endregion Exports


