


// #region Imports

import React from 'react'; // What: React. Why: TabSetCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { annStaFun    } from './announce.js';                       // What: Announce Status Function. Why: Several actions here (export, import, reset) need to speak a transient status to screen readers once they finish. How: This is called after each of those actions completes, sometimes assertively so it is not dropped by a focus move.
import { APP_VER_STR  } from '../../constants.js';                  // What: App Version String. Why: The About section shows the real build version. How: This is rendered in the About section's version row.
import { ButBasCom    } from '../../ui/button.jsx';                 // What: Button Base Component. Why: Nearly every action in this tab (install, export/import/reset, replay tour, view legal docs) is triggered from this shared button component. How: This is rendered throughout the tab with varying kind/size/icon props.
import { CarSurCom    } from '../../ui/card-surface.jsx';           // What: Card Surface Component. Why: Every section's own controls sit inside this shared bordered container. How: This wraps the contents of nearly every set-subsection and set-section below.
import { CelPreCom    } from './previews.jsx';                      // What: Celebration Preview Component. Why: The completion-celebration style picker needs a live preview the user can play. How: This is rendered inside the Completion Celebration card, driven by celStyStr/celTokNum.
import { ConSupCom    } from './contact-support.jsx';               // What: Contact Support Component. Why: The Account section's own support form lives in its own file. How: This is rendered once in TabSetCom's Account section.
import { HelButCom    } from '../../help/button.jsx';               // What: Help Button Component. Why: This tab needs its own toggle for entering/exiting help mode, like every other tab. How: This is rendered in the header, toggling helModBoo.
import { HelOveCom    } from '../../help/mode.jsx';                 // What: Help Overlay Component. Why: Help mode needs its own dimmed overlay plus tooltips layered above this tab's real content. How: This is rendered once, driven by helModBoo and SET_HEL_ARR.
import { HolEdiCom    } from './holiday-editor.jsx';                // What: Holiday Editor Component. Why: The Holidays section's own editable list lives in its own file. How: This is rendered once in TabSetCom's Holidays section.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled Export/Reset button still needs to explain why it is disabled. How: This wraps those buttons, given a label prop with the explanation.
import { LegModCom    } from './legal-docs.jsx';                    // What: Legal Modal Component. Why: The Legal section's View buttons need somewhere to actually show the Privacy Policy/Terms of Service text. How: This is rendered once, driven by legDocStr, and closed by clearing that state back to null.
import { NOT_NAM_OBJ  } from '../../platform/notify.js';            // What: Notification Namespace Object. Why: The Daily generator's notify-me row needs to read/request the browser's notification permission. How: This is called via its own perCheFun()/askOncFun()/reqPerFun()/subAddFun() methods.
import { ONB_SPI_ARR  } from '../../state/onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Replaying the welcome tour needs to tell a real, established account apart from one still holding only seeded sample pickers. How: This is checked against staAppObj.pickers to decide whether to self-heal stale onboarding flags before the tour starts.
import { PicAniCom    } from './previews.jsx';                      // What: Picker Animation Component. Why: The picker-animation style picker needs a live preview the user can play. How: This is rendered inside the Picker Animation card, driven by picPreStr/picTokNum.
import { PWA_NAM_OBJ  } from '../../platform/pwa.js';               // What: Progressive Web App Namespace Object. Why: The Data Control section reports install/persistence state and drives the install prompt. How: This is called via its own subscribe()/isaStaFun()/canInsFun()/insStaFun()/askInsFun()/askPerFun() methods.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: A jump-to-section scroll and both preview stages must not animate for a user who prefers reduced motion. How: This is checked before choosing 'smooth' vs 'auto' scroll behavior, and to track the note shown above each style picker.
import { SegConCom    } from '../../ui/segmented-control.jsx';      // What: Segment Control Component. Why: The tab-bar-placement control is a 3-way exclusive choice, the exact shape this shared control renders. How: This renders the bottom/side/top options, driven by the persisted tabPlacement value.
import { SET_HEL_ARR  } from '../../help/content.jsx';              // What: Settings Help Array. Why: Help mode needs this tab's own catalog of tooltip targets. How: This is passed straight to HelOveCom.
import { STG_NAM_OBJ  } from '../../state/storage.js';              // What: Storage Namespace Object. Why: The Data Control section reports where data lives and reads the true persisted pick log before exporting. How: This is called via its own staRepFun()/reaPerFun() methods.
import { StyRadCom    } from './style-radio.jsx';                   // What: Style Radio Component. Why: Appearance's Picker animation and Completion celebration pickers share one radio list. How: This is rendered twice in TabSetCom's Appearance section.
import { TheSecCom    } from './theme-picker.jsx';                  // What: Theme Section Component. Why: Appearance's own Light and Dark theme cards live in their own file. How: This is rendered once in TabSetCom's Appearance section.
import { togFadFun    } from '../../ui/edge-fade.js';               // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { useEscCanFun } from '../../ui/escape-cancel.js';           // What: Use Escape Cancel Function. Why: Both the pending-import and pending-reset confirmations need Escape to back out, like every other confirm in the app. How: This is called once per confirmation, gated on that confirmation's own open boolean.

// #endregion Imports



/**
 * tab-settings.jsx = Tab Settings
 *
 * @summary
 * The Settings tab. TabSetCom ties every section together: Appearance (the
 * system-preference switch, the Light and Dark theme cards from
 * theme-picker.jsx, the 2 style pickers built on style-radio.jsx's own
 * StyRadCom, and the tab-bar placement control), the Daily generator schedule
 * and its notification row, the Holidays editor (holiday-editor.jsx), Data
 * control (storage status, install, export, import, and reset), Account, About
 * (including contact-support.jsx's own support form), and Legal. A left-hand
 * section rail tracks and drives scroll position across all of them.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region SET_SEC_ARR

/**
 * SET_SEC_ARR = Settings Section Array
 *
 * @summary
 * Every entry below shares this exact shape, read by both the section
 * rail's own links and TabSetCom's own scroll-spy/jump-to logic; none of
 * the 7 entries repeat these same fields' own boilerplate comments (see
 * the "Repeated-shape object literals" comment exception in CLAUDE.md).
 * Each entry's own trailing comment instead just names which specific
 * section it represents. Order matters: the rail renders its links in
 * this exact order, matching the order the sections themselves render in.
 *
 * - `ideStr` (String): Identifier String uniquely identifies the section,
 *   compared against actSecStr and used as the section's own secMapRef
 *   key.
 *
 * - `labStr` (String): Label String names the section for the user,
 *   rendered as the rail link's own visible text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SET_SEC_ARR = [ // What: Settings Section Array. Why: This drives both the left nav (in this exact order) and the scroll-spy/jump-to logic, keeping the 2 in lockstep. How: This is mapped over in the rail's own nav links and read by the scroll-spy effect and jumSecFun.


	{ ideStr : 'appearance', labStr : 'Appearance'      }, // What: Appearance Section Object. Why: Theme, animation, and layout controls live here. How: This is the first rail link and the tab's own top section.
	{ ideStr : 'daily',      labStr : 'Daily generator' }, // What: Daily Section Object. Why: The generator's own schedule and notifications live here. How: This is the second rail link.
	{ ideStr : 'holidays',   labStr : 'Holidays'        }, // What: Holidays Section Object. Why: The holiday and days-off editor lives here. How: This is the third rail link.
	{ ideStr : 'data',       labStr : 'Data control'    }, // What: Data Section Object. Why: Storage status, install, export, import, and reset live here. How: This is the fourth rail link.
	{ ideStr : 'account',    labStr : 'Account'         }, // What: Account Section Object. Why: The future sync feature is announced here. How: This is the fifth rail link.
	{ ideStr : 'about',      labStr : 'About'           }, // What: About Section Object. Why: App identity, the replay tour, and contact support live here. How: This is the sixth rail link.
	{ ideStr : 'legal',      labStr : 'Legal'           }  // What: Legal Section Object. Why: The Privacy Policy and Terms of Service live here. How: This is the last rail link, given extra room below it by the Legal spacer effect so its own top can scroll up to the spy's base line.


];

// #endregion SET_SEC_ARR

// #endregion Constants



// #region Helpers

// #region forRunFun

/**
 * forRunFun = Format Run Function
 *
 * @summary
 * Formats a 24-hour "HH:MM" run-time string, as persisted for the Daily
 * generator's automatic run time, into a friendly 12-hour clock label
 * such as "4:00 AM" for the Daily generator section's own copy.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param runTimStr - Run Time String: The raw 24-hour "HH:MM" string to
 *                    format; defaults to '04:00' when missing or falsy.
 *
 * @returns The formatted 12-hour clock label, such as "4:00 AM".
 *
 * @example
 * ```ts
 * forRunFun( '04:00' ) // => '4:00 AM'
 * ```
 *
*/

function forRunFun ( runTimStr ) {


	const [ houValNum, minValNum ] = ( runTimStr || '04:00' ).split( ':' ).map( Number ); // What: Hour Value Number And Minute Value Number. Why: The raw "HH:MM" string must be split into numeric parts before it can be reformatted. How: This splits runTimStr (or the '04:00' default) on ':' and maps both halves through Number.

	const merSufStr = houValNum < 12 ? 'AM' : 'PM';               // What: Meridiem Suffix String. Why: A 12-hour label needs to say whether the hour is morning or afternoon/evening. How: This reads 'AM' for any hour before noon, 'PM' otherwise.
	const houDisNum = houValNum % 12 === 0 ? 12 : houValNum % 12; // What: Hour Display Number. Why: A 24-hour hour of 0 or 12 must read as "12" on a 12-hour clock, never "0". How: This takes the 24-hour hour modulo 12, substituting 12 whenever that remainder is 0.



	return `${ houDisNum }:${ String( minValNum ).padStart( 2, '0' ) } ${ merSufStr }`; // What: Formatted Label Return. Why: This is the function's whole purpose, a friendly "H:MM AM/PM" string. How: This joins houDisNum, the zero-padded minute, and merSufStr with the literal punctuation a 12-hour clock label needs.


}

// #endregion forRunFun

// #endregion Helpers



// #region Components

// #region TabSetCom

/**
 * TabSetCom = Tab Settings Component
 *
 * @summary
 * Renders the whole Settings tab: a left-hand section rail (scroll-spy
 * plus jump-to, mirroring the Today tab's own group rail) beside a
 * right-hand pane holding every section in order (Appearance, Daily
 * generator, Holidays, Data control, Account, About, Legal). Owns the
 * Appearance preview stages, the Daily generator's notification
 * permission flow, the Data Control section's install/persist/export/
 * import/reset flows, and the Legal modal.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Actions Store Object: {@link useAppStaFun}
 * @param props.onNavHomFun - On Navigate Home Function: Navigates back to the
 *                            Today tab.
 * @param props.onNavTabFun - On Navigate Tab Function: Navigates to an
 *                            arbitrary tab by id.
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 *
 * @returns The tab's own header, the section rail, and every section's
 * content in the right-hand pane, plus the Legal modal.
 *
 * @example
 * ```tsx
 * TabSetCom({ actStoObj, onNavHomFun, ... }) // => <TabSetCom />
 * ```
 *
*/

function TabSetCom ( { actStoObj, onNavHomFun, onNavTabFun, staAppObj } ) {


	const appCurObj = staAppObj.appearance || { autoSystem : false, customDark : null, customLight : null, theme : 'ink' }; // What: Appearance Current Object. Why: A very old/incomplete persisted state might not carry an appearance object at all. How: This falls back to a default ink/no-custom-themes/no-auto-system object when staAppObj.appearance is missing.



	const [ legDocStr, setLegDocStr ] = React.useState( null ); // What: Legal Document String And Setter. Why: The Legal section's own View buttons need somewhere to record which document ('privacy' | 'terms') to show, or null for neither. How: This gates and selects LegModCom's own content below.



	// #region Help Mode

	const [ helModBoo, setHelModBoo ] = React.useState( false ); // What: Help Mode Boolean And Setter. Why: This whole tab needs one shared flag for whether help mode is currently active. How: This gates HelOveCom below and is toggled by the header's own HelButCom. // Help mode (see help/mode.jsx); every section here is static UI chrome, no data-dependent content, so unlike Pickers/Data/Stats no disposable sample data needs seeding.

	const helExiFun = React.useCallback( () => setHelModBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable callback to call when the user exits help mode from inside the overlay itself. How: This clears helModBoo; memoized with an empty dependency array since it only ever closes over a stable setter.

	// #endregion Help Mode



	// #region Style Previews

	const [ celTokNum, setCelTokNum ] = React.useState( 0 );          // What: Celebration Token Number And Setter. Why: CelPreCom needs a bump-to-replay signal distinct from which style is selected. How: This is incremented by plaCelFun and passed straight through as CelPreCom's own repTokNum prop. // Appearance preview stages: bumping a token replays; celStyStr/picPreStr hold which style is currently showing (null = idle, selector visible).
	const [ celStyStr, setCelStyStr ] = React.useState( 'confetti' ); // What: Celebration Style String And Setter. Why: The preview stage needs to know which specific style to actually play. How: This is set by plaCelFun and passed straight through as CelPreCom's own styKeyStr prop.
	const [ picTokNum, setPicTokNum ] = React.useState( 0 );          // What: Picker Token Number And Setter. Why: PicAniCom needs a bump-to-replay signal distinct from which style is selected. How: This is incremented by plaPicFun and passed straight through as PicAniCom's own repTokNum prop.
	const [ picPreStr, setPicPreStr ] = React.useState( null );       // What: Picker Preview String And Setter. Why: The picker-animation stage should keep showing whichever style was last previewed, not the selected style, once its own cycle finishes. How: This is set by plaPicFun and, while non-null, overrides the selected pickAnim value passed to PicAniCom.


	// #region plaCelFun

	/**
	 * plaCelFun = Play Celebration Function
	 *
	 * @summary
	 * Plays a completion celebration style in its preview stage. It selects
	 * newStyStr for the stage and bumps the replay token, which is what makes
	 * CelPreCom play again even when the same style is previewed twice.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param newStyStr - New Style String: The celebration style to preview, e.g.
	 *                    'confetti'.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * plaCelFun( 'confetti' ) // => void
	 * ```
	 *
	*/

	const plaCelFun = ( newStyStr ) => { // What: Play Celebration Function. Why: Pressing Preview on a celebration style option needs to both select and immediately replay that style. How: This sets celStyStr to newStyStr, then bumps celTokNum to trigger CelPreCom's own replay effect.


		setCelStyStr( newStyStr );                      // What: Celebration Style Set. Why: The stage needs to know which style to play. How: This writes newStyStr into celStyStr.
		setCelTokNum( ( tokCurNum ) => tokCurNum + 1 ); // What: Celebration Token Bump. Why: A fresh token is what actually replays the stage, even for the same style twice. How: This increments celTokNum.


	};

	// #endregion plaCelFun


	// #region plaPicFun

	/**
	 * plaPicFun = Play Pick Function
	 *
	 * @summary
	 * Plays a picker animation style in its preview stage. It holds newStyStr as
	 * the previewed style, which the stage keeps showing after the animation
	 * ends, and bumps the replay token so PicAniCom remounts and plays again.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param newStyStr - New Style String: The picker animation style to preview,
	 *                    e.g. 'reel'.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * plaPicFun( 'reel' ) // => void
	 * ```
	 *
	*/

	const plaPicFun = ( newStyStr ) => { // What: Play Pick Function. Why: Pressing Preview on a picker-animation style option needs to both select and immediately replay that style. How: This sets picPreStr and bumps picTokNum to trigger PicAniCom's own remount. // The strip runs ~2s. picPreStr keeps holding the previewed style after it ends (it never reverts to the selected style), so the stage keeps the previewed animation's final frame instead of snapping to another style.


		setPicPreStr( newStyStr );                      // What: Picker Preview Set. Why: The stage needs to know which style to play. How: This writes newStyStr into picPreStr.
		setPicTokNum( ( tokCurNum ) => tokCurNum + 1 ); // What: Picker Token Bump. Why: A fresh token is what actually remounts PicAniCom, even for the same style twice. How: This increments picTokNum.


	};

	// #endregion plaPicFun

	// #endregion Style Previews



	// #region Scroll-Spy And Jump-To

	const [ actSecStr, setActSecStr ] = React.useState( 'daily' ); // What: Active Section String And Setter. Why: Both the rail's own highlighted link and the scroll-spy effect below need one shared source of truth for which section reads as current. How: This is written by the scroll-spy effect during normal scrolling and by jumSecFun when a rail link is clicked. // Mirrors the Today tab's own group rail. The scroll container is the shared <main className="main">; sections live in the right pane and the sticky rail on the left tracks / drives position.
	const [ legMinNum, setLegMinNum ] = React.useState( 0 );       // What: Legal Minimum Number And Setter. Why: Legal is the last section, so without extra room below it the page runs out of scroll before its own top can reach the spy's base line. How: This holds the minimum height the Legal section needs, measured by the Legal spacer effect below and applied as its own minHeight.

	const secMapRef = React.useRef( {} );    // What: Section Map Reference. Why: Every section below registers itself here via its own ref callback, giving the scroll-spy/jump-to logic a live lookup from section id to DOM element. How: This is written to by each section's own ref prop and read throughout this component.
	const raiEleRef = React.useRef( null );  // What: Rail Element Reference. Why: stiOffFun and the rail-fade effect both need a handle on the rail's own outer element. How: This is attached to the aside's own ref prop below.
	const raiScrRef = React.useRef( null );  // What: Rail Scroll Reference. Why: The rail-fade effect needs to read scroll position from the actual scrolling element, distinct from the sticky outer rail the fade classes are toggled on. How: This is attached to the rail's own inner scroll wrapper below. // The mobile pill bar's own horizontal scroller, separate from raiEleRef; see the fade-edge effect's own comment below for why.
	const rooEleRef = React.useRef( null );  // What: Root Element Reference. Why: The scroll-spy effect needs a handle on this component's own root to find its nearest '.main' scroll ancestor. How: This is attached to the tab's own outer div below.
	const skiSpyRef = React.useRef( false ); // What: Skip Spy Reference. Why: A section just jumped to via the rail must not have scroll-spy immediately recompute over it mid-scroll. How: This is set true for the duration of jumSecFun's own scroll animation and read as a guard at the top of the scroll-spy handler.


	const stiOffFun = () => { // What: Sticky Offset Function. Why: Both the scroll-spy handler and jumSecFun need the exact same "how far below the viewport top" figure, computed fresh each time layout may have changed. How: This measures the rail's own current orientation and height, returning the extra offset a mobile sticky bar needs on top of a fixed 16px margin. // Where a jumped-to section should land below the top of the scroll viewport (the desktop rail sticks at 16px; on mobile the rail is a sticky bar, so its own height is added too). Measured live so the 2 stay in agreement.


		const raiCurEle = raiEleRef.current;                                                  // What: Rail Current Element. Why: This gives a stable local handle on the rail for this measurement pass. How: This is read once from raiEleRef.current.
		const lisCurEle = raiCurEle && raiCurEle.querySelector( 'ul' );                       // What: List Current Element. Why: The rail's own flex-direction is not a reliable signal; its child ul's is. How: This queries the rail's own <ul> child. // .settings-rail is display:block; only its own <ul> flips to row on mobile, so orientation is read from the ul (the rail's own flex-direction is always the 'row' default and would misreport as horizontal on desktop).
		const horDirBoo = lisCurEle && getComputedStyle( lisCurEle ).flexDirection === 'row'; // What: Horizontal Direction Boolean. Why: The extra offset is only needed while the rail actually renders as a horizontal mobile bar. How: This checks the ul's own computed flex-direction for 'row'.



		return ( horDirBoo ? raiCurEle.offsetHeight + 8 : 0 ) + 16; // What: Sticky Offset Return. Why: This is the actual usable offset callers add to their own scroll-position math. How: This adds the rail's own measured height plus 8px only in the horizontal/mobile case, then always adds a flat 16px margin.


	};


	React.useEffect( () => { // What: Scroll Spy Effect. Why: The rail's own active link must track which section is actually in view as the user scrolls, without fighting a section the user just explicitly jumped to. How: This computes, on every scroll, which registered section's own top has crossed the spy's base line.


		const secEntArr = SET_SEC_ARR.filter( ( secConObj ) => secMapRef.current[ secConObj.ideStr ] ).map( ( secConObj ) => [ secConObj.ideStr, secMapRef.current[ secConObj.ideStr ] ] ); // What: Section Entry Array. Why: Only sections that have actually mounted and registered a ref can be measured. How: This drops any SET_SEC_ARR entry whose element is still missing, then maps the rest to [id, element] pairs.


		if ( !secEntArr.length ) return; // What: No Sections Guard. Why: There is nothing to spy on before any section has mounted. How: This bails out of the whole effect early when secEntArr came back empty.



		const scrConEle = rooEleRef.current?.closest( '[data-element-name-hook="appConMai"]' );    // What: Scroll Container Element. Why: The shared '.main' scroller, not the window, is what actually needs to be measured/listened to in the normal case. How: This walks up from this component's own root to the nearest '.main' ancestor.
		const spyIdeSet = new Set( [ 'daily', 'holidays', 'data', 'account', 'about', 'legal' ] ); // What: Spy Identifier Set. Why: Every section after the first should be assignable active purely from scroll position. How: This is checked inside the loop below, skipping any section whose id is not a member. // Appearance is left out on purpose: it's the fallback whenever no later section has crossed the base line. Legal can take part like every other section thanks to the Legal spacer effect below, which gives it enough scroll room to reach the base line.


		const onScrEveFun = () => { // What: On Scroll Event Function. Why: This is the actual scroll-spy computation, re-run on every scroll event. How: This finds the last spy-eligible section whose own top has crossed the base line.


			if ( skiSpyRef.current ) return; // What: Skip Spy Guard. Why: A section the user just explicitly jumped to must not be immediately overridden mid-animation by this same computation. How: This bails out early while skiSpyRef.current is true.



			const basLinNum = ( scrConEle ? scrConEle.getBoundingClientRect().top : 0 ) + stiOffFun() + 8; // What: Base Line Number. Why: A section only counts as "reached" once its own top has scrolled up past this line. How: This adds the sticky offset plus an 8px margin to the scroll container's own top (or 0 for the window case).


			let besIdeStr = secEntArr[ 0 ][ 0 ]; // What: Best Identifier String. Why: Some section must always end up active, defaulting to the very first one. How: This starts at the first entry's own id and is overwritten below as later, already-reached sections are found.


			for ( const [ secIdeStr, secCurEle ] of secEntArr ) { // What: Section Scan Loop. Why: The last spy-eligible section whose own top has crossed the base line is the one that should read active. How: This iterates every registered section in order, keeping the latest one that qualifies.


				if ( !spyIdeSet.has( secIdeStr ) ) continue; // What: Spy Eligibility Guard. Why: Appearance, the fallback section, must never be assigned active by this scan. How: This skips any section id not present in spyIdeSet.



				if ( secCurEle.getBoundingClientRect().top <= basLinNum ) besIdeStr = secIdeStr; // What: Reached Section Update. Why: A later section whose own top has already crossed the base line should win over an earlier one. How: This overwrites besIdeStr whenever the current section's own top is at or above the base line.


			}



			setActSecStr( besIdeStr ); // What: Active Section Update Call. Why: This is what actually moves the rail's own highlighted link. How: This writes besIdeStr into actSecStr.


		};


		onScrEveFun(); // What: Initial Scroll Spy Call. Why: The rail should already reflect the right section on mount, without waiting for the first scroll event. How: This invokes onScrEveFun once, synchronously.

		( scrConEle || window ).addEventListener( 'scroll', onScrEveFun, { passive : true } ); // What: Scroll Container Listener. Why: Most of the time there is a real '.main' scroller to listen to directly. How: This subscribes onScrEveFun to the container's own scroll event, or the window's if no container was found.

		window.addEventListener( 'scroll', onScrEveFun, { passive : true } ); // What: Window Scroll Listener. Why: A secondary window-level listener catches any scroll path the container-level one might miss. How: This subscribes onScrEveFun to the window's own scroll event as well.



		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both the container-level and window-level scroll listeners.


			( scrConEle || window ).removeEventListener( 'scroll', onScrEveFun ); // What: Scroll Container Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same onScrEveFun reference from the same target.

			window.removeEventListener( 'scroll', onScrEveFun ); // What: Window Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same onScrEveFun reference from the window.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own listeners once, on mount. How: An empty array means it never re-subscribes; every value it reads (refs, SET_SEC_ARR) is stable across renders anyway.


	React.useEffect( () => { // What: Rail Fade Effect. Why: The mobile pill bar's own start/end fade edges need to reflect real scroll position, toggled on the non-scrolling outer rail. How: This reads scroll position from the inner scroller but writes the resulting classes onto the outer rail, resubscribing on both scroll and resize. // Scroll-edge fades on the mobile rail (horizontal pill bar), the same affordance as the Data/Stats filter rows. The fade itself (.settings-rail::before/::after, styles2.css) lives on the STICKY outer rail, not on the element that actually scrolls (raiScrRef, the inner wrapper around <ul>); an earlier version put overflow-x AND the fade pseudo-elements on the same (outer) element, which meant the fade (a position:absolute child of that scrolling element) scrolled away WITH the pills instead of staying pinned to the visible edges (confirmed on real devices, not a Chromium-sandbox-only quirk: reproduced in both Firefox and Chrome emulation). Reading scroll state from the inner wrapper but toggling the state classes on the outer (non-scrolling) rail keeps the fade itself immobile while still tracking real scroll position.


		const scrCurEle = raiScrRef.current; // What: Scroll Current Element. Why: The scrolling inner wrapper is what actually needs measuring. How: This is read once from raiScrRef.current.
		const raiCurEle = raiEleRef.current; // What: Rail Current Element. Why: The non-scrolling outer rail is what the resulting fade classes actually get written onto. How: This is read once from raiEleRef.current.


		if ( !scrCurEle || !raiCurEle ) return; // What: Missing Element Guard. Why: Nothing can be measured or toggled if either element is not actually mounted yet. How: This bails out early whenever either lookup above failed.



		const updFadFun = () => togFadFun( scrCurEle, raiCurEle ); // What: Update Fade Function. Why: This is the actual recomputation, re-run on scroll and on resize. How: This calls togFadFun on scrCurEle, putting the classes on raiCurEle.


		updFadFun(); // What: Initial Fade Call. Why: The fade edges should already be correct on mount, without waiting for the first scroll/resize event. How: This invokes updFadFun once, synchronously.

		scrCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Fade Scroll Listener. Why: The fade edges must update live as the bar itself is scrolled. How: This subscribes updFadFun to scrCurEle's own scroll event.


		const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The bar's own overflow can change from a layout/content change alone, not just a real scroll. How: This creates an observer that re-runs updFadFun whenever scrCurEle itself resizes.


		resObsObj.observe( scrCurEle ); // What: Resize Observer Start Call. Why: This is what actually begins watching scrCurEle for size changes. How: This starts the observer created just above.



		return () => { // What: Effect Cleanup Function. Why: Neither the scroll listener nor the observer may outlive this effect run. How: This removes the scroll listener and disconnects the resize observer.


			scrCurEle.removeEventListener( 'scroll', updFadFun ); // What: Fade Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same updFadFun reference from scrCurEle.

			resObsObj.disconnect(); // What: Resize Observer Teardown. Why: The observer must not keep watching scrCurEle after this effect run ends. How: This disconnects resObsObj entirely.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own listener/observer once, on mount. How: An empty array means it never re-subscribes; both refs it reads are stable across renders.


	React.useEffect( () => { // What: Legal Spacer Effect. Why: Legal is the last section, so the page used to run out of scroll before its own top could reach the spy's base line, leaving it impossible to highlight by scrolling (or to stay highlighted after a jump). How: This measures how tall Legal must be for its own top to scroll up to the sticky offset, re-measuring whenever the scroll container resizes, and stores that in legMinNum.


		const legCurEle = secMapRef.current[ 'legal' ];                                         // What: Legal Current Element. Why: The Legal section is the one being sized. How: This looks up its own registered element in secMapRef.
		const scrConEle = rooEleRef.current?.closest( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: The shared '.main' scroller's own height and scroll range drive the measurement. How: This walks up from this component's own root to the nearest '.main' ancestor.


		if ( !legCurEle || !scrConEle ) return; // What: Missing Element Guard. Why: Nothing can be measured if either element is not actually mounted. How: This bails out early whenever either lookup above failed.



		const meaSpaFun = () => { // What: Measure Spacer Function. Why: The needed height depends on the live viewport and the sticky rail's own offset, both of which can change. How: This subtracts the content below Legal and the sticky offset from the container's own visible height.


			const legRecObj = legCurEle.getBoundingClientRect();                                                   // What: Legal Rect Object. Why: Legal's own bottom edge marks where the content below it starts. How: This reads Legal's own current on-screen rect.
			const conRecObj = scrConEle.getBoundingClientRect();                                                   // What: Container Rect Object. Why: Legal's own position has to be converted into the container's own content coordinates. How: This reads the container's own current on-screen rect.
			const belLegNum = scrConEle.scrollHeight - ( legRecObj.bottom - conRecObj.top + scrConEle.scrollTop ); // What: Below Legal Number. Why: Content below Legal (the container's own bottom padding) also counts toward its scroll room. How: This subtracts Legal's own bottom, in content coordinates, from the container's own full scroll height.


			setLegMinNum( Math.max( 0, Math.ceil( scrConEle.clientHeight - stiOffFun() - belLegNum ) ) ); // What: Legal Minimum Update Call. Why: Legal's own top can only reach the sticky offset once Legal plus everything below it fills the rest of the visible height. How: This stores the container's own visible height minus the sticky offset and the content below Legal, never below 0.


		};


		meaSpaFun(); // What: Initial Spacer Measure Call. Why: The spacer should already be correct on mount. How: This invokes meaSpaFun once, synchronously.


		const resObsObj = new ResizeObserver( meaSpaFun ); // What: Resize Observer Object. Why: A window resize, rotation, or tab-bar placement change can change the container's own visible height. How: This creates an observer that re-runs meaSpaFun whenever the container resizes.


		resObsObj.observe( scrConEle ); // What: Resize Observer Start Call. Why: This is what actually begins watching the container for size changes. How: This starts the observer created just above.



		return () => resObsObj.disconnect(); // What: Effect Cleanup Function. Why: The observer must not keep watching after this effect run ends. How: This disconnects resObsObj entirely.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own observer once, on mount. How: An empty array means it never re-subscribes; the refs it reads are stable, and stiOffFun, though recreated every render, only ever reads those same refs, so the first render's copy always measures correctly.



	const jumSecFun = ( secIdeStr ) => { // What: Jump Section Function. Why: Clicking a rail link should scroll straight to that section and mark it active immediately, rather than waiting on the scroll-spy to catch up. How: This marks the target active, then scrolls the right container to the right offset.


		const secCurEle = secMapRef.current[ secIdeStr ]; // What: Section Current Element. Why: There is nothing to jump to if this section has not actually registered a ref. How: This looks up secIdeStr in secMapRef.


		if ( !secCurEle ) return; // What: Missing Section Guard. Why: A stale or unregistered section id must not crash the jump. How: This bails out early when secCurEle came back undefined.



		setActSecStr( secIdeStr ); // What: Active Section Update Call. Why: The rail should highlight the target section immediately, not wait for the scroll to finish. How: This writes secIdeStr into actSecStr.

		skiSpyRef.current = true; // What: Skip Spy Set. Why: The scroll-spy handler must not fight this deliberate jump while it is still animating. How: This flags skiSpyRef true, checked as a guard at the top of onScrEveFun above.

		const scrConEle = secCurEle.closest( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: The shared '.main' scroller, not the window, is what actually needs scrolling in the normal case. How: This walks up from secCurEle to its nearest '.main' ancestor.
		const jumTopBoo = secIdeStr === SET_SEC_ARR[ 0 ].ideStr;                       // What: Jump Top Boolean. Why: Jumping to the very first section should reveal the tab's own header too, not just that section. How: This is true only when secIdeStr matches SET_SEC_ARR's own first entry. // The first section is the top of the tab; scroll all the way up so the header comes back into view rather than stopping at the section.


		if ( scrConEle ) { // What: Container Scroll Check. Why: The normal case scrolls inside '.main', while the fallback scrolls the window. How: This takes the container branch whenever a '.main' ancestor was found.


			const offDelNum = secCurEle.getBoundingClientRect().top - scrConEle.getBoundingClientRect().top; // What: Offset Delta Number. Why: The scroll target must be computed relative to the container's own current scroll position, not an absolute page position. How: This is the section's own top minus the container's own top.
			const topPosNum = jumTopBoo ? 0 : scrConEle.scrollTop + offDelNum - stiOffFun();                 // What: Top Position Number. Why: This is the actual scrollTop value to animate to. How: This is 0 for the top-of-tab case, otherwise the container's own current scrollTop plus offDelNum, minus the sticky offset so the section lands below the rail/header.


			scrConEle.scrollTo({ // What: Container Scroll Call. Why: This is the actual scroll animation for the normal, in-'.main' case. How: This scrolls scrConEle to topPosNum, animated unless reduced motion is preferred.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion should not see an animated scroll. How: This picks 'auto' under reduced motion, 'smooth' otherwise.
				top      : topPosNum                        // What: Top. Why: This is the computed landing position. How: This passes topPosNum straight through.


			});


		}

		else { // What: Window Scroll Branch. Why: With no '.main' ancestor, the window itself is what scrolls. How: This runs only when scrConEle is missing.


			const topPosNum = jumTopBoo ? 0 : secCurEle.getBoundingClientRect().top + window.scrollY - stiOffFun(); // What: Top Position Number. Why: This is the actual scrollTo value for the fallback, window-level scroll case. How: This is 0 for the top-of-tab case, otherwise the section's own viewport top plus the current window scroll, minus the sticky offset.


			window.scrollTo({ // What: Window Scroll Call. Why: This is the actual scroll animation for the fallback case, when no '.main' ancestor was found. How: This scrolls the window to topPosNum, animated unless reduced motion is preferred.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion should not see an animated scroll. How: This picks 'auto' under reduced motion, 'smooth' otherwise.
				top      : topPosNum                        // What: Top. Why: This is the computed landing position. How: This passes topPosNum straight through.


			});


		}



		setTimeout( () => { skiSpyRef.current = false; }, 620 ); // What: Skip Spy Release. Why: The scroll-spy handler should resume normal computation once the jump's own scroll animation has had time to finish. How: This clears skiSpyRef back to false 620ms later.


	};

	// #endregion Scroll-Spy And Jump-To



	// #region Reduced Motion Note

	const [ redMotBoo, setRedMotBoo ] = React.useState( () => !!( redMotFun && redMotFun() ) ); // What: Reduce Motion Boolean And Setter. Why: Both style-picker sections need to know live whether the OS currently prefers reduced motion. How: This starts from an immediate redMotFun() check, then is kept in sync by the effect below. // Both animation-choice sections are inert while the OS "reduce motion" setting is on: the app skips the pick reveal and the completion celebration entirely. The PREVIEWS still play on demand (pressing Play is explicit consent), so without this note the choice would look active when it isn't. Tracked live so the note appears/disappears if the OS setting changes mid-session.


	React.useEffect( () => { // What: Reduce Motion Listener Effect. Why: redMotBoo needs to update live if the OS setting changes while the app is open, not just reflect its value at mount. How: This subscribes a change listener to the prefers-reduced-motion media query and cleans it up on unmount.


		if ( !window.matchMedia ) return; // What: No MatchMedia Guard. Why: Some environments may not support matchMedia at all. How: This bails out of the effect entirely when matchMedia isn't available, leaving redMotBoo at its initial value.



		const medQueObj   = window.matchMedia( '(prefers-reduced-motion: reduce)' ); // What: Media Query Object. Why: The same query used for the initial value must be reused here so the listener matches. How: This is the live MediaQueryList the change listener below attaches to.
		const onMotChaFun = () => setRedMotBoo( medQueObj.matches );                 // What: On Motion Change Function. Why: The OS's own reduced-motion setting can change at any time while the app is open. How: This updates redMotBoo to the media query's current match state whenever it fires a change event.


		medQueObj.addEventListener ? medQueObj.addEventListener( 'change', onMotChaFun ) : medQueObj.addListener( onMotChaFun ); // What: Change Subscribe Call. Why: Older browsers only support the deprecated addListener form. How: This registers onMotChaFun via whichever subscription method medQueObj actually supports.



		return () => { medQueObj.removeEventListener ? medQueObj.removeEventListener( 'change', onMotChaFun ) : medQueObj.removeListener( onMotChaFun ); }; // What: Effect Cleanup Return. Why: The change listener must not outlive this effect run. How: This removes the same onMotChaFun reference, via whichever method it was originally added with.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.


	const motNotFun = ( namTexStr ) => redMotBoo ? ( // What: Motion Note Function. Why: Both style-picker sections need the exact same reduced-motion note, differing only in what they name. How: This returns the note paragraph while redMotBoo is true, or null to render nothing.


		<p className='settings-sub set-rm-note'>Your system is set to reduce motion, so { namTexStr } will not play in the app. You can still preview each one here.</p> // What: Set Rm Note Paragraph Element. Why: This is the actual note copy, naming whichever feature the caller passed in. How: This renders namTexStr inline inside the fixed surrounding sentence.


	) : null; // What: No Note Branch. Why: Nothing needs saying while motion is allowed. How: This returns null so the caller renders nothing.

	// #endregion Reduced Motion Note



	// #region Daily Generator Notifications

	const [ notPerStr, setNotPerStr ] = React.useState( () => ( NOT_NAM_OBJ ? NOT_NAM_OBJ.perCheFun() : 'unsupported' ) ); // What: Notification Permission String And Setter. Why: The notify-me row needs the browser's own current notification permission to decide which of its 3 states to show. How: This starts from an immediate NOT_NAM_OBJ.perCheFun() check, then is kept in sync by the effect below. // Permission is asked exactly once, from the run-time change gesture: that is the moment the user has shown they care when the generator runs, and a denied prompt can't be re-shown by us.


	React.useEffect( () => { // What: Notification Permission Subscribe Effect. Why: notPerStr needs to update live if permission changes outside this row's own controls, such as via the browser's own site settings. How: This subscribes to NOT_NAM_OBJ's own change notifications and cleans up on unmount.


		if ( !NOT_NAM_OBJ ) return; // What: No Notification Support Guard. Why: An environment without notification support at all has nothing to subscribe to. How: This bails out of the effect entirely when NOT_NAM_OBJ is unavailable.



		return NOT_NAM_OBJ.subAddFun( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); // What: Permission Subscribe Return. Why: This both wires up the live subscription and returns its own unsubscribe function for cleanup. How: This calls NOT_NAM_OBJ.subAddFun with a handler that refreshes notPerStr, returning the subscription's own teardown function directly.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes; NOT_NAM_OBJ itself is a stable module-level import.


	const onRunChaFun = ( newTimStr ) => { // What: On Run Change Function. Why: Changing the run-time is the one deliberate gesture this section asks notification permission from. How: This saves the new run time, then (if supported) asks for permission exactly once.


		actStoObj.daiTimFun( newTimStr ); // What: Run Time Save Call. Why: This is the actual persisted setting the Daily generator reads to know when to run. How: This calls actStoObj.daiTimFun with newTimStr.


		if ( NOT_NAM_OBJ ) NOT_NAM_OBJ.askOncFun().then( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); // What: Ask Once Call. Why: This specific gesture is the one moment this app ever asks for notification permission unprompted. How: This calls NOT_NAM_OBJ.askOncFun, refreshing notPerStr once it resolves.


	};


	const enaNotFun = () => { if ( NOT_NAM_OBJ ) NOT_NAM_OBJ.reqPerFun().then( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); }; // What: Enable Notification Function. Why: The notify-me row's own explicit Enable button needs a direct way to (re-)request permission. How: This calls NOT_NAM_OBJ.reqPerFun, refreshing notPerStr once it resolves.

	// #endregion Daily Generator Notifications



	// #region Storage And Installation

	const [ stoStaObj, setStoStaObj ] = React.useState( null ); // What: Storage Status Object And Setter. Why: The Data Control section's "Where your data lives" row needs the real, live storage status to render at all. How: This is populated by the effect below and read throughout the Data Control section. // Reports where the data actually lives, whether the browser has promised not to evict it, and how fresh the fallback copy is. Refreshed on mount and whenever the PWA layer changes (install, persistence grant).
	const [ , setPwaTicNum ]          = React.useState( 0 );    // What: Progressive-Web-App Tick Number Setter. Why: A PWA-layer change (install, persistence grant) needs to force a re-render even though it doesn't directly change any other piece of state here. How: This is incremented by the effect below whenever PWA_NAM_OBJ.subscribe fires; the tick value itself is never read, so only the setter is bound.
	const [ perMesObj, setPerMesObj ] = React.useState( null ); // What: Persist Message Object And Setter. Why: Both the Install and Protect Data actions need somewhere to report their own outcome. How: This is set by onInsAppFun/onProDatFun and rendered as a status line in the storage row.


	React.useEffect( () => { // What: Storage Status Effect. Why: The storage row needs to read real, live status on mount and stay in sync with any later PWA-layer change. How: This reads STG_NAM_OBJ.staRepFun() once immediately, then again every time PWA reports a change, guarding against a result landing after unmount.


		let mouAliBoo = true; // What: Mount Alive Boolean. Why: An async STG_NAM_OBJ.staRepFun() read must not update state after this component has already unmounted. How: This starts true and is flipped false in this effect's own cleanup, checked before every state write below.


		const reaStaFun = () => { // What: Read Status Function. Why: This centralizes the actual status read so both the immediate call and the PWA-subscribe handler share the same logic. How: This calls STG_NAM_OBJ.staRepFun() and writes the result into stoStaObj, but only while still mounted.


			if ( !STG_NAM_OBJ ) return; // What: No Storage Guard. Why: An environment somehow missing the storage layer entirely has nothing to read. How: This bails out early when STG_NAM_OBJ is unavailable.



			STG_NAM_OBJ.staRepFun().then( ( staResObj ) => { if ( mouAliBoo ) setStoStaObj( staResObj ); } ); // What: Status Read Call. Why: This is the actual async read of where/how data is currently stored. How: This resolves STG_NAM_OBJ.staRepFun() and writes its result into stoStaObj, guarded by mouAliBoo.


		};


		reaStaFun(); // What: Initial Status Read. Why: The row should already show real status on mount, without waiting for a PWA-layer change. How: This invokes reaStaFun once, synchronously (its own internal read is still async).


		const onPwaChaFun = () => { // What: On Progressive-Web-App Change Function. Why: An install or persistence-grant event can change both the storage status and the install/standalone flags read below. How: This bumps pwaTicNum to force a re-render, then re-reads the storage status.


			setPwaTicNum( ( ticCurNum ) => ticCurNum + 1 ); // What: Progressive-Web-App Tick Bump. Why: The install/standalone flags below are read fresh on every render, so a re-render is all they need. How: This increments the unread tick value.

			reaStaFun(); // What: Status Re-Read Call. Why: A PWA-layer change can also change the storage status itself. How: This re-runs reaStaFun.


		};


		const pwaOffFun = PWA_NAM_OBJ // What: Progressive-Web-App Off Function. Why: The subscription needs its own unsubscribe function kept for cleanup. How: This subscribes onPwaChaFun to PWA_NAM_OBJ's own change notifications, or holds null when PWA_NAM_OBJ is unavailable.
			? PWA_NAM_OBJ.subscribe( onPwaChaFun ) // What: Subscribe Branch. Why: The PWA layer is available to listen to. How: This keeps PWA_NAM_OBJ's own returned unsubscribe function.
			: null;                                // What: Unavailable Branch. Why: There is nothing to subscribe to without a PWA layer. How: This holds null, checked in the cleanup below.



		return () => { // What: Effect Cleanup Function. Why: Both the alive flag and the PWA subscription must be torn down together on unmount. How: This flips mouAliBoo false and calls pwaOffFun, if one was actually created.


			mouAliBoo = false; // What: Mount Alive Clear. Why: A status read still in flight must not write state after unmount. How: This flips mouAliBoo false, checked before every write.

			if ( pwaOffFun ) pwaOffFun(); // What: Progressive-Web-App Unsubscribe Call. Why: The subscription must not outlive this component. How: This calls pwaOffFun whenever one was actually created.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own subscription once, on mount. How: An empty array means it never re-subscribes; STG_NAM_OBJ and PWA_NAM_OBJ are stable module-level imports.


	const isaStaBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaStaFun() );                                   // What: Is-A Standalone Boolean. Why: Several install-related rows below need to know whether the app is already running installed/standalone. How: This calls PWA_NAM_OBJ.isaStaFun(), guarded against PWA_NAM_OBJ itself being unavailable.
	const canInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.canInsFun() );                                   // What: Can Install Boolean. Why: The Install button itself should only render while an install prompt is actually available. How: This calls PWA_NAM_OBJ.canInsFun(), guarded against PWA_NAM_OBJ itself being unavailable.
	const iosInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaIosBoo && !isaStaBoo );                       // What: iOS Install Boolean. Why: iOS/iPadOS need their own "Add to Home Screen" instructions instead of the native install prompt. How: This is true only when PWA_NAM_OBJ reports isaIosBoo and the app is not already standalone.
	const macInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaMacBoo && !isaStaBoo );                       // What: Mac Install Boolean. Why: macOS Safari needs its own "Add to Dock" instructions instead of the native install prompt. How: This is true only when PWA_NAM_OBJ reports isaMacBoo and the app is not already standalone.
	const insStaStr = ( PWA_NAM_OBJ && PWA_NAM_OBJ.insStaFun ) ? PWA_NAM_OBJ.insStaFun() : 'pending'; // What: Install State String. Why: The Data Control section's own install-related messaging branches on this exact value. How: This calls PWA_NAM_OBJ.insStaFun(), falling back to 'pending' when that method itself is unavailable. // Feature-detected rather than named-browser: 'unsupported' covers Firefox and anything else without the install prompt, and stays 'pending' until we have actually waited long enough to know.



	const forBytFun = ( bytCouNum ) => { // What: Format Byte Function. Why: The storage row needs a human-readable size, not a raw byte count. How: This picks whichever of B/KB/MB unit reads most naturally for bytCouNum's own magnitude.


		if ( bytCouNum == null ) return '—'; // What: Missing Byte Count Guard. Why: A not-yet-known size should render as a placeholder dash, not "undefined B". How: This returns the em-dash placeholder glyph whenever bytCouNum is null/undefined.



		if ( bytCouNum < 1024 ) return bytCouNum + ' B'; // What: Byte Unit Branch. Why: A very small size reads most naturally in plain bytes. How: This returns bytCouNum suffixed with ' B' whenever it is under 1024.



		if ( bytCouNum < 1024 * 1024 ) return ( bytCouNum / 1024 ).toFixed( 0 ) + ' KB'; // What: Kilobyte Unit Branch. Why: A size under 1MB reads most naturally in whole kilobytes. How: This divides bytCouNum by 1024, rounds to a whole number, and suffixes it with ' KB'.



		return ( bytCouNum / 1048576 ).toFixed( 1 ) + ' MB'; // What: Megabyte Unit Return. Why: Anything larger reads most naturally in megabytes with 1 decimal of precision. How: This divides bytCouNum by 1048576 and suffixes it with ' MB'.


	};



	const forWheFun = ( isoTimStr ) => { // What: Format When Function. Why: The storage row's "fallback copy" fact needs a friendly relative-or-absolute label, not a raw ISO timestamp. How: This special-cases "never" and "today", otherwise falling back to a short absolute date, catching any parse failure along the way.


		if ( !isoTimStr ) return 'not yet this install'; // What: Missing Timestamp Guard. Why: A fallback copy that has never actually been written needs its own distinct label. How: This returns a fixed "not yet this install" string whenever isoTimStr is falsy.



		try { // What: Timestamp Format Try. Why: A malformed timestamp can throw while being formatted. How: This wraps the formatting so the catch below can fall back to 'unknown'.


			const mirDatObj = new Date( isoTimStr );                                                        // What: Mirror Date Object. Why: The fallback copy's own timestamp needs to be a real Date before it can be compared or formatted. How: This parses isoTimStr.
			const nowDatObj = new Date();                                                                   // What: Now Date Object. Why: Deciding between "today" and an absolute date requires comparing against the current moment. How: This captures the current time.
			const samDayBoo = mirDatObj.toDateString() === nowDatObj.toDateString();                        // What: Same Day Boolean. Why: A same-calendar-day timestamp reads more naturally as "today" than as a repeated date. How: This compares mirDatObj's own toDateString() against nowDatObj's.
			const timLabStr = mirDatObj.toLocaleTimeString( [], { hour : 'numeric', minute : '2-digit' } ); // What: Time Label String. Why: Both the "today" and absolute-date branches need the same formatted time-of-day suffix. How: This formats mirDatObj as a locale time with no seconds.



			return samDayBoo ? `today at ${ timLabStr }` : mirDatObj.toLocaleDateString( [], { day : 'numeric', month : 'short' } ) + ` at ${ timLabStr }`; // What: Formatted When Return. Why: This is the function's whole purpose, a friendly relative-or-absolute label. How: This returns "today at TIME" for a same-day timestamp, otherwise a short locale month/day date plus "at TIME".


		}

		catch ( errCauObj ) { return 'unknown'; } // What: Parse Failure Guard. Why: A malformed timestamp must not crash the storage row. How: This falls back to a plain 'unknown' label.


	};



	const onInsAppFun = async () => { // What: On Install App Function. Why: The Install button's own click handler needs to run the real install prompt and report its outcome. How: This awaits PWA_NAM_OBJ.askInsFun() and sets perMesObj based on whether the user accepted or dismissed it.


		const insResStr = await PWA_NAM_OBJ.askInsFun(); // What: Install Result String. Why: The actual outcome ('accepted' | 'dismissed') decides which message to show. How: This awaits PWA_NAM_OBJ's own askInsFun() call.


		if ( insResStr === 'accepted' ) setPerMesObj( { okaBoo : true, texStr : 'Installed. Your data is now protected from browser cleanup.' } ); // What: Accepted Branch. Why: A successful install is worth confirming, including that it also protects the user's data. How: This sets perMesObj to a success message whenever insResStr is 'accepted'.

		else if ( insResStr === 'dismissed' ) setPerMesObj( { okaBoo : false, texStr : 'Install dismissed.' } ); // What: Dismissed Branch. Why: An explicitly dismissed prompt is still worth a small acknowledgement. How: This sets perMesObj to a neutral message whenever insResStr is 'dismissed'.


	};


	const onProDatFun = async () => { // What: On Protect Data Function. Why: The Protect Data button's own click handler needs to run the real persistence request and report its outcome. How: This awaits PWA_NAM_OBJ.askPerFun(), sets perMesObj accordingly, then refreshes the storage status row.


		const perOkaBoo = await PWA_NAM_OBJ.askPerFun( true ); // What: Persist Okay Boolean. Why: Whether the browser actually granted persistence decides which message to show. How: This awaits PWA_NAM_OBJ's own askPerFun(true) call.


		setPerMesObj( perOkaBoo // What: Persist Message Update. Why: The user needs to know whether the grant actually happened, and what to do next if it didn't. How: This sets a success message when perOkaBoo is true, otherwise a message suggesting installing the app instead.
			? { okaBoo : true, texStr : 'Granted. This browser will not evict your data.' }                                   // What: Granted Branch. Why: A successful grant is worth confirming. How: This sets a success message.
			: { okaBoo : false, texStr : 'The browser declined for now. Installing the app is the surest way to get it.' } ); // What: Declined Branch. Why: A declined grant should point at the surer alternative. How: This sets a message suggesting installing the app instead.


		if ( STG_NAM_OBJ ) STG_NAM_OBJ.staRepFun().then( setStoStaObj ); // What: Storage Status Refresh Call. Why: A persistence grant is itself a change the storage row's own status should immediately reflect. How: This re-reads STG_NAM_OBJ.staRepFun() and writes the result straight into stoStaObj.


	};

	// #endregion Storage And Installation



	// #region Data Control Export Import And Reset

	const filInpRef = React.useRef( null );  // What: File Input Reference. Why: The Import button itself is not the real file input; it needs a handle on the real (visually hidden) one to trigger its own click. How: This is attached to the hidden file input's own ref prop below.
	const expButRef = React.useRef( null );  // What: Export Button Reference. Why: expDatFun needs a handle on the Export button to restore focus to it after the download link is clicked. How: This is attached to the Export ButBasCom's own ref prop below. // Both actions hand focus away (export clicks a download link, import opens the file dialog), leaving focus on <body> where a screen reader starts reading the browser and page title. Refocus the button that was used and annStaFun through the app-level live region.
	const impButRef = React.useRef( null );  // What: Import Button Reference. Why: Both onImpFilFun's own failure path and the focus-restore effect below need a handle on the Import button. How: This is attached to the Import ButBasCom's own ref prop below. // Both actions hand focus away (export clicks a download link, import opens the file dialog), leaving focus on <body> where a screen reader starts reading the browser and page title. Refocus the button that was used and annStaFun through the app-level live region.
	const impConRef = React.useRef( null );  // What: Import Confirm Reference. Why: Opening the confirmation should move focus onto its own Import button. How: This is attached to that button's own ref prop below.
	const impFocRef = React.useRef( false ); // What: Import Focus Reference. Why: The commit where the real Import button remounts happens after this closing function returns, so a plain synchronous focus call here would be too early. How: This flags that focus should be restored, consumed by the effect below once penImpObj is actually cleared. // Set when a confirm closes; consumed by the effect that runs after the Import button has actually remounted, so focus never lands on <body>.
	const resButRef = React.useRef( null );  // What: Reset Button Reference. Why: Closing the confirmation without resetting should return focus to the row's own Reset button. How: This is attached to that button's own ref prop below. // Same unmount-on-swap problem as the import row: the trigger button is replaced by the confirm pair, so focus has to be moved deliberately in the commit AFTER each swap or it falls to <body>.
	const resConRef = React.useRef( null );  // What: Reset Confirm Reference. Why: Opening the confirmation should move focus onto its own Reset button. How: This is attached to that button's own ref prop below. // Same unmount-on-swap problem as the import row: the trigger button is replaced by the confirm pair, so focus has to be moved deliberately in the commit AFTER each swap or it falls to <body>.
	const resFocRef = React.useRef( false ); // What: Reset Focus Reference. Why: The commit where the real Reset button remounts happens after the closing function returns, so a plain synchronous focus call here would be too early. How: This flags that focus should be restored, consumed by the effect below once conResBoo is actually cleared.

	const [ impMesObj, setImpMesObj ] = React.useState( null );  // What: Import Message Object And Setter. Why: A completed (or failed) import needs somewhere to report its own outcome once the confirmation itself is gone. How: This is rendered as a status line below the import row.
	const [ penImpObj, setPenImpObj ] = React.useState( null );  // What: Pending Import Object And Setter. Why: A chosen backup file must be confirmed in-app before it actually replaces all data. How: This holds the parsed { datObj, namStr } pair while the confirm row is showing, read by runImpFun. // Parsed-but-unconfirmed backup. Replaces a native confirm(), which the browser owns and no screen reader can be told about.
	const [ impLeaBoo, setImpLeaBoo ] = React.useState( false ); // What: Import Leaving Boolean And Setter. Why: Closing the import confirmation should play its own leave animation before actually unmounting. How: This flags the confirm row as leaving for the duration of that animation.
	const [ expMesObj, setExpMesObj ] = React.useState( null );  // What: Export Message Object And Setter. Why: A completed export needs somewhere to report how many history entries it actually included. How: This is rendered as a status line below the export row.
	const [ conResBoo, setConResBoo ] = React.useState( false ); // What: Confirm Reset Boolean And Setter. Why: The Reset row needs to know whether its own confirm pair is currently showing. How: This swaps the Reset button for the confirm pair below.
	const [ resLeaBoo, setResLeaBoo ] = React.useState( false ); // What: Reset Leaving Boolean And Setter. Why: Closing the reset confirmation should play its own leave animation before actually unmounting. How: This flags the confirm row as leaving for the duration of that animation.
	const [ resMesStr, setResMesStr ] = React.useState( null );  // What: Reset Message String And Setter. Why: A completed reset needs somewhere to report its own outcome, once the row's own Reset button has gone away. How: This is rendered as a status line below the reset row.



	const hasPicBoo = ( staAppObj.pickers || [] ).length > 0;        // What: Has Picker Boolean. Why: Export and Reset only make sense once any picker exists. How: This checks staAppObj.pickers for at least 1 entry, treating a missing array as empty.
	const hasIteBoo = ( staAppObj.items || [] ).length > 0;          // What: Has Item Boolean. Why: Export and Reset only make sense once any item exists. How: This checks staAppObj.items for at least 1 entry, treating a missing array as empty.
	const hasConBoo = ( staAppObj.conditionals || [] ).length > 0;   // What: Has Conditional Boolean. Why: Export and Reset only make sense once any conditional exists. How: This checks staAppObj.conditionals for at least 1 entry, treating a missing array as empty.
	const hasTasBoo = ( staAppObj.tasks || [] ).length > 0;          // What: Has Task Boolean. Why: Export and Reset only make sense once any reminder exists. How: This checks staAppObj.tasks for at least 1 entry, treating a missing array as empty.
	const hasPclBoo = ( staAppObj.pickLog || [] ).length > 0;        // What: Has Pick-Log Boolean. Why: Export and Reset only make sense once any pick history has accrued. How: This checks staAppObj.pickLog for at least 1 entry, treating a missing array as empty.
	const hasCdlBoo = ( staAppObj.conditionalLog || [] ).length > 0; // What: Has Conditional-Log Boolean. Why: Export and Reset only make sense once any conditional history has accrued. How: This checks staAppObj.conditionalLog for at least 1 entry, treating a missing array as empty.
	const hasGroBoo = ( staAppObj.groups || [] ).length > 0;         // What: Has Group Boolean. Why: Export and Reset only make sense once any group exists. How: This checks staAppObj.groups for at least 1 entry, treating a missing array as empty.

	const hasDatBoo = hasPicBoo || hasIteBoo || hasConBoo || hasTasBoo || hasPclBoo || hasCdlBoo || hasGroBoo; // What: Has Data Boolean. Why: Both the Export and Reset rows need to know whether there is actually anything to export/reset at all. How: This is true whenever any one of the 7 collections above is non-empty. // Something to reset? True if the user has created any pickers, items, conditionals, reminders, groups, or accrued any pick/completion history.


	const cloResFun = () => { // What: Close Reset Confirm Function. Why: Backing out of the reset confirmation (via Cancel or Escape) needs the same leave-then-unmount handling as every other confirm here. How: This flags focus for restoration, then either closes immediately (reduced motion) or plays the leave animation first.


		resFocRef.current = true; // What: Reset Focus Flag Set. Why: The focus-restore effect below needs to know this specific close was a real "back out" rather than a successful reset. How: This flags resFocRef true, consumed once conResBoo actually flips back to false.



		if ( redMotFun() ) { setConResBoo( false ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see the confirm pair close immediately, not play a leave animation. How: This closes the confirm immediately and bails out whenever redMotFun() reports true.



		setResLeaBoo( true ); // What: Reset Leaving Flag Set. Why: This is what actually triggers the leave animation's own CSS class. How: This flags resLeaBoo true.

		setTimeout( () => { // What: Delayed Close Call. Why: The confirm pair must not actually unmount until its own leave animation has had time to play. How: This waits 150ms, then closes the confirm and clears the leaving flag together.


			setConResBoo( false ); // What: Confirm Close. Why: The leave animation has finished, so the confirm pair can unmount. How: This flips conResBoo back to false.
			setResLeaBoo( false ); // What: Reset Leaving Clear. Why: The confirm pair is gone, so nothing is leaving anymore. How: This flips resLeaBoo back to false.


		}, 150 ); // What: Leave Animation Delay. Why: The confirm pair must finish leaving before it unmounts. How: This 150ms matches the leave animation's duration.


	};


	useEscCanFun( conResBoo && !resLeaBoo, cloResFun ); // What: Escape Cancel Function. Why: Every confirmation in this tab backs out on Escape, and the reset confirm is no exception. How: This calls useEscCanFun, active only while the confirm is open and not already leaving, invoking cloResFun. // Escape backs out of the reset confirmation, like the other confirms.


	React.useEffect( () => { // What: Reset Focus Effect. Why: Focus must follow the swap between the Reset button and the confirm pair in both directions, since the element under it is unmounted/remounted each time. How: This focuses the confirm's own Reset button on open, or restores focus to the row's own Reset button on a deliberate close.


		if ( conResBoo ) { if ( resConRef.current ) resConRef.current.focus(); return; } // What: Confirm Open Focus Guard. Why: Opening the confirm should move focus onto its own, now-visible Reset button. How: This focuses resConRef's own current element and bails out of the rest of the effect whenever conResBoo is true.



		if ( !resFocRef.current ) return; // What: No Pending Restore Guard. Why: A close that happened via a real reset (not a Cancel/Escape) has nowhere to restore focus to. How: This bails out whenever resFocRef was never actually flagged.



		resFocRef.current = false; // What: Reset Focus Flag Clear. Why: This restore should only ever fire once per close. How: This clears resFocRef back to false immediately, before the focus call below.

		if ( resButRef.current ) resButRef.current.focus(); // What: Reset Button Focus Call. Why: This is the actual focus restoration, back to the row's own Reset button. How: This focuses resButRef's own current element, if it is mounted.


	}, [ conResBoo ] ); // What: Effect Dependency Array. Why: This must re-run every time the confirm pair opens or closes, since each direction needs its own focus move. How: conResBoo is the single value both directions of this effect are built around.



	const expDatFun = async () => { // What: Export Data Function. Why: The Export button needs to build and download a full backup, sourced from the true persisted state rather than only in-memory state. How: This reads the freshest available pick log, builds a JSON blob, announces the result, then triggers the download.


		let expPayObj = staAppObj; // What: Export Payload Object. Why: The exported backup needs one single object to serialize, defaulting to the in-memory state. How: This starts as staAppObj itself and is only replaced below if a fresher persisted pick log is actually found. // Export from the STORE OF RECORD, not just memory. If this session booted from the warm localStorage mirror (which omits the pick log), the in-memory log is empty and a naive export would silently drop all history, so the Stats tab would come back blank after a round-trip.



		try { // What: Persisted Read Try. Why: Reading the persisted state can fail (a broken IDB, a missing storage layer). How: This wraps the read so the catch below can fall back to in-memory state.


			if ( STG_NAM_OBJ && STG_NAM_OBJ.reaPerFun ) { // What: Storage Reader Check. Why: The persisted read only exists when the storage layer does. How: This runs the read only while STG_NAM_OBJ.reaPerFun is available.


				const perStaObj = await STG_NAM_OBJ.reaPerFun(); // What: Persisted State Object. Why: The real persisted pick log may be longer than whatever this session's in-memory state currently holds. How: This awaits STG_NAM_OBJ's own reaPerFun() call.


				if ( perStaObj && Array.isArray( perStaObj.pickLog ) && perStaObj.pickLog.length > ( staAppObj.pickLog || [] ).length ) expPayObj = { ...staAppObj, pickLog : perStaObj.pickLog }; // What: Fresher Pick Log Swap. Why: Only an actually-longer persisted pick log is worth swapping in; a shorter or equal one is not. How: This overwrites expPayObj's own pickLog with perStaObj's, keeping every other field from staAppObj.


			}


		}

		catch ( errCauObj ) {} // What: Persisted Read Failure Guard. Why: A failed read must never block the export. How: This silently swallows the error, falling back to in-memory state.



		const entCouNum = ( expPayObj.pickLog || [] ).length;                                                  // What: Entry Count Number. Why: Both the announcement and the on-screen status line need to say how many history entries the export actually included. How: This reads the length of expPayObj's own (possibly swapped-in) pickLog.
		const expBloObj = new Blob( [ JSON.stringify( expPayObj, null, 2 ) ], { type : 'application/json' } ); // What: Export Blob Object. Why: A downloadable file needs to exist as a real Blob, not just a JS object. How: This serializes expPayObj as pretty-printed JSON inside a JSON-typed Blob.
		const expUrlStr = URL.createObjectURL( expBloObj );                                                    // What: Export Url String. Why: A Blob needs an object URL before a real download link can reference it. How: This creates a temporary object URL for expBloObj, revoked further below once the download has started.
		const dowLinEle = document.createElement( 'a' );                                                       // What: Download Link Element. Why: Triggering a file download from script requires a real, if never-inserted, anchor element. How: This is configured below with its own href/download attributes, then clicked without ever being appended to the document.
		const datStaStr = new Date().toISOString().slice( 0, 10 );                                             // What: Date Stamp String. Why: The downloaded filename should carry today's own date for easy identification. How: This takes the first 10 characters of an ISO timestamp, i.e. its own "YYYY-MM-DD" date portion.


		dowLinEle.href     = expUrlStr;                          // What: Download Href Assignment. Why: This is what actually points the anchor at the freshly-built backup blob. How: This sets dowLinEle's own href to expUrlStr.
		dowLinEle.download = `ease-my-life-${ datStaStr }.json`; // What: Download Filename Assignment. Why: A named download attribute is what gives the saved file a sensible name instead of a random blob id. How: This sets dowLinEle's own download attribute to a dated, app-branded filename.

		setExpMesObj( { entNum : entCouNum, timNum : Date.now() } ); // What: Export Message Update. Why: The on-screen status line needs both a fresh React key and the actual entry count. How: This writes a timestamp/entries pair into expMesObj.

		annStaFun( `Backup exported, including ${ entCouNum } history ${ entCouNum === 1 ? 'entry' : 'entries' }.`, { assertive : true } ); // What: Export Announce Call. Why: A screen-reader user needs to hear the export actually happened, including how much history it carried. How: This announces the entry count assertively, pluralized correctly for exactly 1 entry. // Announce BEFORE firing the download. The browser's own download UI takes focus the moment the link is clicked, and a screen reader that follows focus into browser chrome drops any pending polite announcement, so the speech has to be assertive and already under way. The file is fully built by this point, so "exported" is true when it is said.

		setTimeout( () => { // What: Download Trigger Timeout. Why: The announcement above needs a brief head start before the download link steals focus. How: This waits 220ms, then clicks the anchor, restores focus, and schedules the object URL's own cleanup.


			dowLinEle.click(); // What: Download Click Call. Why: This is the actual trigger that starts the file download. How: This calls click() on the never-inserted dowLinEle. // Never put the anchor in the document: appending it and clicking it is what moved focus to <body>. A detached anchor downloads identically. Focus is then re-asserted on the button, so if the browser's download UI does not grab it, focus stays somewhere meaningful.

			if ( expButRef.current ) expButRef.current.focus(); // What: Export Button Focus Call. Why: Focus should land somewhere meaningful even if the browser's own download UI does not claim it. How: This focuses expButRef's own current element, if mounted.



			setTimeout( () => URL.revokeObjectURL( expUrlStr ), 1000 ); // What: Object Url Revoke Timeout. Why: The temporary object URL must eventually be released, but not before the browser has had time to actually start the download. How: This revokes expUrlStr 1000ms after the click.


		}, 220 ); // What: Announcement Head Start. Why: The screen-reader announcement should land before the download steals focus. How: This waits 220ms before clicking the link.


	};



	const onImpFilFun = ( chaEveObj ) => { // What: On Import File Function. Why: Choosing a backup file needs to be parsed and held for in-app confirmation before it can actually replace all data. How: This reads the chosen file as text, parses it as JSON, and either stages it as penImpObj or reports a read failure.


		const impFilObj = chaEveObj.target.files && chaEveObj.target.files[ 0 ]; // What: Import File Object. Why: The native file input may have no file chosen at all, such as a cancelled dialog. How: This reads the first (and only) selected file, or undefined.

		chaEveObj.target.value = ''; // What: File Input Reset. Why: Re-selecting the exact same file later must still fire a fresh change event. How: This clears the native input's own value back to empty.



		if ( !impFilObj ) return; // What: No File Guard. Why: A cancelled file dialog leaves nothing to read. How: This bails out early whenever impFilObj is falsy.



		const filReaObj = new FileReader(); // What: File Reader Object. Why: Reading a File's own text contents requires the FileReader API. How: This is configured below via its own onload handler, then started with readAsText.


		filReaObj.onload = () => { // What: File Reader Onload Handler. Why: The file's own text is only available once this callback fires. How: This parses the read text as JSON, validating it looks like a real backup before staging it.


			try { // What: Backup Parse Try. Why: Arbitrary file contents may not be valid JSON, or may not be a real backup. How: This wraps parsing and validation so the catch below can report either failure.


				const impDatObj = JSON.parse( filReaObj.result ); // What: Import Data Object. Why: A backup file's own contents must be valid JSON before anything else can happen. How: This parses filReaObj's own result string.


				if ( !impDatObj || !Array.isArray( impDatObj.pickers ) ) throw new Error( 'Not an Ease My Life backup.' ); // What: Shape Validation Guard. Why: Arbitrary JSON that merely parses is not necessarily a real backup. How: This throws, routing to the catch below, whenever the parsed object is missing or has no real pickers array.



				setImpMesObj( null ); // What: Import Message Clear. Why: A fresh file choice should not carry over a stale message from an earlier attempt. How: This clears impMesObj back to null. // Hold the parsed backup and ask in-app. No separate announcement: the file dialog closing already sends the reader through browser chrome, and an assertive message on top of that lands third, after its own noise and the focus move. Instead focus moves (a little late, so the dialog transition has settled) to the confirm button, whose name plus aria-describedby warning is read as a single utterance.

				setPenImpObj( { datObj : impDatObj, namStr : impFilObj.name } ); // What: Pending Import Set. Why: This is what actually surfaces the in-app confirmation row below. How: This stages the file's own name and parsed data together.

				setTimeout( () => { if ( impConRef.current ) impConRef.current.focus(); }, 300 ); // What: Confirm Focus Timeout. Why: Focus must wait for the file dialog's own close transition to settle before landing on the confirm button. How: This focuses impConRef's own current element 300ms later.


			}

			catch ( errCauObj ) { // What: Backup Parse Failure Handler. Why: A file that isn't a readable backup needs a clear failure, not a silent no-op. How: This clears any pending import, reports the failure on screen and aloud, and returns focus to the Import button.


				setPenImpObj( null ); // What: Pending Import Clear. Why: A failed parse must not leave a stale pending confirmation around. How: This clears penImpObj back to null.

				setImpMesObj( { okaBoo : false, texStr : 'That file couldn’t be read as a backup.' } ); // What: Import Failure Message. Why: The user needs to know clearly that this specific file did not work. How: This sets impMesObj to a fixed failure message.

				if ( impButRef.current ) impButRef.current.focus(); // What: Import Button Focus Call. Why: Focus should return to a real, actionable control after a failed read. How: This focuses impButRef's own current element, if mounted.



				annStaFun( 'That file couldn’t be read as a backup.', { assertive : true } ); // What: Import Failure Announce Call. Why: A screen-reader user needs to hear the failure too, not just see it. How: This announces the same fixed failure message, assertively.


			}


		};


		filReaObj.readAsText( impFilObj ); // What: Read As Text Call. Why: This is what actually starts the async file read that filReaObj.onload above responds to. How: This reads impFilObj as plain text.


	};



	const cloImpFun = () => { // What: Close Import Confirm Function. Why: Backing out of (or completing) the import confirmation needs the same leave-then-unmount handling as the reset confirmation. How: This flags focus for restoration, then either closes immediately (reduced motion) or plays the leave animation first.


		impFocRef.current = true; // What: Import Focus Flag Set. Why: The focus-restore effect below needs to know this close should restore focus once the real Import button remounts. How: This flags impFocRef true. // Focus restore is driven by a commit-watching effect below, not from here: the Import button is unmounted while the confirm pair shows, and a requestAnimationFrame guess can run before React commits the remount.



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see the confirm pair close immediately, not play a leave animation. How: This closes the confirm immediately and bails out whenever redMotFun() reports true.


			setPenImpObj( null );  // What: Pending Import Clear. Why: The confirm pair should close immediately under reduced motion. How: This clears penImpObj back to null.
			setImpLeaBoo( false ); // What: Import Leaving Clear. Why: Nothing is animating out, so no leave flag should linger. How: This flips impLeaBoo back to false.



			return; // What: Reduced Motion Return. Why: The leave animation below must not also run. How: This exits cloImpFun early.


		}



		setImpLeaBoo( true ); // What: Import Leaving Flag Set. Why: This is what actually triggers the leave animation's own CSS class. How: This flags impLeaBoo true.

		setTimeout( () => { // What: Delayed Close Call. Why: The confirm pair must not actually unmount until its own leave animation has had time to play. How: This waits 150ms, then clears the pending import and the leaving flag together.


			setPenImpObj( null );  // What: Pending Import Clear. Why: The leave animation has finished, so the confirm pair can unmount. How: This clears penImpObj back to null.
			setImpLeaBoo( false ); // What: Import Leaving Clear. Why: The confirm pair is gone, so nothing is leaving anymore. How: This flips impLeaBoo back to false.


		}, 150 ); // What: Leave Animation Delay. Why: The confirm pair must finish leaving before it unmounts. How: This 150ms matches the leave animation's duration.


	};


	const runImpFun = () => { // What: Run Import Function. Why: Confirming the pending import needs to actually replace all data and report success. How: This calls actStoObj.impDatFun with the staged backup, announces and reports success, then closes the confirmation.


		if ( !penImpObj ) return; // What: No Pending Import Guard. Why: There is nothing to confirm if the confirmation was somehow triggered without a staged backup. How: This bails out early whenever penImpObj is null.



		actStoObj.impDatFun( penImpObj.datObj ); // What: Import Data Call. Why: This is the actual store mutation that replaces all data with the staged backup. How: This calls actStoObj.impDatFun with penImpObj's own parsed data.

		setImpMesObj( { okaBoo : true, texStr : 'Backup imported.' } ); // What: Import Success Message. Why: A status line should confirm the import once the confirmation row itself is gone. How: This sets impMesObj to a fixed success message.

		annStaFun( 'Backup imported.' ); // What: Import Success Announce Call. Why: A screen-reader user needs to hear the success too, not just see it. How: This announces the same fixed success message.

		cloImpFun(); // What: Confirm Close Call. Why: A completed import should close the confirmation the same way cancelling it does. How: This calls cloImpFun to play the leave animation and eventually unmount the confirm pair.


	};


	const canImpFun = () => { // What: Cancel Import Function. Why: Explicitly cancelling should discard the staged backup and confirm nothing happened, distinct from a silent Escape dismissal. How: This announces the cancellation, then closes the confirmation the same way a successful import does.


		if ( !penImpObj ) return; // What: No Pending Import Guard. Why: There is nothing to cancel if no backup is actually staged. How: This bails out early whenever penImpObj is null.



		annStaFun( 'Import cancelled.' ); // What: Import Cancelled Announce Call. Why: A screen-reader user needs to hear the cancellation too, not just see the row close. How: This announces a fixed cancellation message.

		cloImpFun(); // What: Confirm Close Call. Why: A cancelled import should close the confirmation the same way a completed one does. How: This calls cloImpFun to play the leave animation and eventually unmount the confirm pair.


	};


	useEscCanFun( !!penImpObj && !impLeaBoo, canImpFun ); // What: Escape Cancel Function. Why: Every confirmation in this tab backs out on Escape, and the import confirm is no exception. How: This calls useEscCanFun, active only while a backup is staged and not already leaving, invoking canImpFun. // Escape backs out of the import confirmation, like every other confirm here.


	React.useEffect( () => { // What: Import Focus Effect. Why: Focus must be restored to the real Import button only in the commit where it has actually remounted back into the tree. How: This checks impFocRef, consuming the flag and focusing impButRef only once penImpObj has actually cleared.


		if ( penImpObj || !impFocRef.current ) return; // What: No Restore Needed Guard. Why: There is nothing to restore while the confirm is still showing, or if this close never flagged a restore. How: This bails out whenever either condition holds.



		impFocRef.current = false; // What: Import Focus Flag Clear. Why: This restore should only ever fire once per close. How: This clears impFocRef back to false immediately, before the focus call below.

		if ( impButRef.current ) impButRef.current.focus(); // What: Import Button Focus Call. Why: This is the actual focus restoration, back to the row's own Import button. How: This focuses impButRef's own current element, if it is mounted.


	}, [ penImpObj ] ); // What: Effect Dependency Array. Why: This must re-run every time the pending import is set or cleared, since the restore can only happen once the button has actually remounted. How: penImpObj is the single value this effect's own change-detection is built around.

	// #endregion Data Control Export Import And Reset



	// #region Row Summary Values

	const picCouNum = ( staAppObj.pickers || [] ).length; // What: Picker Count Number. Why: The export row's own description names exactly how many pickers a backup would include. How: This reads the length of staAppObj.pickers, defaulting to an empty array.
	const iteCouNum = ( staAppObj.items || [] ).length;   // What: Item Count Number. Why: The export row's own description names exactly how many items a backup would include. How: This reads the length of staAppObj.items, defaulting to an empty array.
	const remCouNum = ( staAppObj.tasks || [] ).length;   // What: Reminder Count Number. Why: The export row's own description names exactly how many reminders a backup would include. How: This reads the length of staAppObj.tasks, defaulting to an empty array.



	const daiModStr = ( staAppObj.daily && staAppObj.daily.mode ) || 'auto'; // What: Daily Mode String. Why: The Daily generator section's own copy and controls all branch on whether the generator runs automatically or manually. How: This reads staAppObj.daily's own mode, defaulting to 'auto'.

	// #endregion Row Summary Values



	const bmcIdeStr = 'braMarCli--set'; // What: Brand-Mark-ClipPath Identifier String. Why: This header renders the same logo svg as every other tab header, and clipPath ids must be document-unique. How: This appends a "--set" modifier to the shared braMarCli base id, the same per-tab convention as every other header's own logo ("--tod", "--pic", "--sta", "--dat"), keeping it distinct from the nav's own unmodified "braMarCli".



	return (


		<div
			ref={ rooEleRef }

			className='tab tab--settings'
		>{ /* What: Tab Settings Div Element. Why: This is TabSetCom's own root element, giving the scroll-spy effect a handle to find its nearest '.main' ancestor. How: This wraps the header, the section rail plus right-hand pane, and the Legal modal. */ }


			<HelOveCom
				actModBoo={ helModBoo }
				helIteArr={ SET_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: This tab needs its own help-mode overlay, like every other tab. How: This is driven by helModBoo and SET_HEL_ARR. */ }



			<header className='stat-h'>{ /* What: Stat H Header Element. Why: Every tab shares this same header shape: a kicker row, a brand lockup, and an intro paragraph. How: This wraps the kicker/help-button row, the brand mark plus title, and the intro paragraph. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The section kicker and the help toggle share one row. How: This wraps the kicker span and the HelButCom. */ }


					<div className='kicker stat-h-kicker'>Settings</div>{ /* What: Kicker Div Element. Why: Every tab's header names itself with this same small kicker label. How: This renders the fixed text "Settings". */ }



					<HelButCom
						actModBoo={ helModBoo }

						onClick={ () => setHelModBoo( ( modCurBoo ) => !modCurBoo ) }
					/>{ /* What: Help Button Component. Why: This tab needs its own toggle for entering/exiting help mode. How: This flips helModBoo when clicked. */ }


				</div>



				<div
					className='stat-h-lead'

					data-element-name-hook='heaLeaDiv'
				>{ /* What: Stat H Lead Div Element. Why: The brand mark and the page title sit side by side in this same lead row on every tab. How: This wraps the brand-mark button and the section title. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Settings catalog. */ }


					<button
						className='brand-mark'

						data-element-name-hook='braMarBut'

						type='button'

						aria-label='Ease My Life link to go to the Today page'

						onClick={ onNavHomFun }
					>{ /* What: Brand Mark Button Element. Why: The logo doubles as a shortcut back to the Today tab, same as every other header. How: This calls onNavHomFun when clicked. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Settings catalog. */ }


						<svg
							fill='none'
							viewBox='8 8 528 528'

							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }{ /* Same theme-wired logo as the Today + Stats + Data headers. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id={ bmcIdeStr }

									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }


									<rect
										height='512'
										rx='75'
										ry='75'
										width='512'
										x='16'
										y='16'
									/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


								</clipPath>


							</defs>

							<g
								style={{
									stroke      : 'var(--accent-soft)',
									strokeWidth : 16
								}}
							>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


								<path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings below draw the rest of the grid. */ }

								<path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 320 528 L 320 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 424 528 L 424 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 112 528 L 112 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 216 L 16 216' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 320 L 16 320' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 424 L 16 424' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment, completing the grid. */ }


							</g>

							<rect
								style={{
									stroke         : 'currentColor',
									strokeLinecap  : 'round',
									strokeLinejoin : 'round',
									strokeWidth    : 16
								}}

								height='512'
								rx='75'
								ry='75'
								width='512'
								x='16'
								y='16'
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								style={{
									fill   : 'currentColor',
									stroke : 'currentColor'
								}}

								clipPath={ `url(#${ bmcIdeStr })` }
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='8'
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>


					<div className='section-h'>{ /* What: Section H Div Element. Why: The page title needs its own small wrapper, matching every other tab's header. How: This wraps the h1 title below. */ }


						<h1 className='section-title'>Behind the scenes, of your <span className='stat-title-accent'>eased</span> life.</h1>{ /* What: Section Title H1 Element. Why: Every tab names its own page with this same title style. How: This renders the fixed title text, with "eased" set off in the shared accent span. */ }


					</div>


				</div>



				<p className='section-sub'>All app-wide settings can be found here relating to the app's appearance, the Daily generator, holiday preferences, app data import, export, and deletion, user account, about and legal. All conditionals, reminders, pickers and their items' settings can be found in the <button className='sub-tablink' type='button' onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }>Data page</button>.</p>{ /* What: Section Sub Paragraph Element. Why: Every tab's header ends with this same short intro paragraph. How: This renders the fixed intro copy, with a link to the Data tab via onNavTabFun. */ }


			</header>



			<div className='settings-layout'>{ /* What: Settings Layout Div Element. Why: The section rail and the right-hand pane need to sit side by side. How: This wraps the rail aside and the settings-sections div. */ }


				<aside
					ref={ raiEleRef }

					className='settings-rail'

					data-element-name-hook='setRaiAsi'

					aria-label='Settings sections'
				>{ /* What: Settings Rail Aside Element. Why: This is the sticky/scrollable rail of section links tracked by scroll-spy and driven by jumSecFun. How: This wraps the rail's own kicker and its scrolling <ul> of section links. Its data-element-name-hook is read by help mode's chrome clipping and help mode's Settings catalog. */ }


					<div className='kicker rail-kicker'>Sections</div>{ /* What: Kicker Div Element. Why: The rail needs its own small heading, matching the kicker style used elsewhere. How: This renders the fixed text "Sections". */ }



					<div
						ref={ raiScrRef }

						className='settings-rail-scroll'
					>{ /* What: Settings Rail Scroll Div Element. Why: The rail-fade effect needs a dedicated scrolling element distinct from the non-scrolling outer rail its classes are toggled on. How: This wraps the actual <ul> of section links. */ }{ /* Own scrolling element, separate from .settings-rail itself; see the fade-edge effect's own comment for why. */ }


						<ul>{ /* What: Rail Link List Element. Why: One link is needed per entry in SET_SEC_ARR. How: This maps SET_SEC_ARR into one rail button per section. */ }


							{ SET_SEC_ARR.map( ( secConObj ) => ( // What: Section Link Map. Why: One rail link is needed per registered section, in the same fixed order the sections themselves render in. How: This maps SET_SEC_ARR to one <li><button> pair per entry, keyed by its own ideStr.


								<li key={ secConObj.ideStr }>{ /* What: Rail Link Li Element. Why: Every rail link needs its own list item, matching standard nav-list markup. How: This wraps the single rail-btn button below. */ }


									<button
										className={ ` rail-btn   ${ actSecStr === secConObj.ideStr ? 'is-on' : '' } ` }

										onClick={ () => jumSecFun( secConObj.ideStr ) }
									>{ /* What: Rail Btn Button Element. Why: This is the actual clickable control that jumps to and highlights this specific section. How: This calls jumSecFun with this section's own ideStr when clicked, and marks itself "is-on" while actSecStr matches. */ }


										<span className='rail-name'>{ secConObj.labStr }</span>{ /* What: Rail Name Span Element. Why: Every rail link needs its own visible section name. How: This renders secConObj's own labStr. */ }


									</button>


								</li>


							) ) }


						</ul>


					</div>


				</aside>



				<div className='settings-sections'>{ /* What: Settings Sections Div Element. Why: The right-hand pane holds every section's own real content, in the same fixed order as the rail. How: This renders one <section> per entry in SET_SEC_ARR, each registering itself into secMapRef via its own ref callback. */ }


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'appearance' ] = secCurEle; } }

						className='set-section set-section--appearance'

						data-element-name-hook='setAppSec'
					>{ /* What: Appearance Section Element. Why: This is the Appearance section's own root, registering itself for scroll-spy/jump-to. How: This wraps the system-preference row, the Theme cards, the 2 style pickers, and the tab-placement control. Its data-element-name-hook is read by the Settings page tour and help mode's Settings catalog. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Appearance</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Appearance". */ }


						</div>

						<p className='settings-sub'>Control the appearance of Ease My life, including colors, animations and tab placement.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Appearance. */ }

						<div
							className='set-subsection set-subsection--systempref'

							data-element-name-hook='sysPreDiv'
						>{ /* What: System Pref Subsection Div Element. Why: The system-preference toggle needs its own labeled subsection, first among Appearance's own controls. How: This wraps the toggle row's own CarSurCom. Its data-element-name-hook is read by the App Features tours. */ }


							<CarSurCom>{ /* What: Card Surface Component. Why: The toggle row needs the same bordered container as every other row in this tab. How: This wraps the system-preference row below. */ }


								<div
									className='set-data-row'

									data-element-name-hook='setRowDiv'
								>{ /* What: System Pref Row Div Element. Why: The label/description and the switch need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the switch button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: System Pref Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the switch. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>System preference</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "System preference". */ }

										<span
											key={ String( !!appCurObj.autoSystem ) }

											className='set-data-sub set-sub-fade'
										>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the toggle's own state, and should fade between the 2 versions. How: This remounts (via its own boolean-string key) and renders one of 2 explanatory sentences depending on appCurObj.autoSystem. */ }


											{ appCurObj.autoSystem ? ( // What: Auto System Check. Why: The description reads differently depending on whether the system preference is on. How: This renders the automatic copy while appCurObj.autoSystem is truthy, otherwise the manual copy.


												<React.Fragment>Your <strong>system</strong> will apply light and dark themes <strong>according to its preferences</strong>. Whichever theme is selected below will apply its counterpart (e.g. Ink &rarr; Night) when applicable.</React.Fragment> // What: Automatic Copy Fragment Element. Why: This explains what the system preference does while it is on. How: This renders fixed copy with its key phrases in bold.


											) : ( // What: Manual Copy Branch. Why: With the system preference off, themes only change by hand. How: This renders the else branch, taken while appCurObj.autoSystem is falsy.


												<React.Fragment>Themes will only be applied <strong>manually</strong> according to whichever preference you select in the options below.</React.Fragment> // What: Manual Copy Fragment Element. Why: This explains that themes only change by hand while the preference is off. How: This renders fixed copy with "manually" in bold.


											) }


										</span>


									</div>

									<button
										className={ ` switch   ${ appCurObj.autoSystem ? 'is-on' : '' } ` }

										aria-label='System preference'
										aria-pressed={ !!appCurObj.autoSystem }

										onClick={ () => actStoObj.setSysFun( !appCurObj.autoSystem ) }
									>{ /* What: System Pref Switch Button Element. Why: This is the actual control that flips between automatic and manual theme selection. How: This calls actStoObj.setSysFun with the toggled value when clicked. */ }


										<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


									</button>


								</div>


							</CarSurCom>


						</div>



						<TheSecCom
							actStoObj={ actStoObj }
							staAppObj={ staAppObj }
						/>{ /* What: Theme Section Component. Why: The Light and Dark theme cards are substantial enough to live in their own component. How: This renders both cards, driven by the same shared state/actions this whole tab receives. */ }



						<div
							className='set-subsection set-subsection--celebration'

							data-element-name-hook='celStyDiv'
						>{ /* What: Celebration Subsection Div Element. Why: The completion-celebration style picker needs its own labeled subsection. How: This wraps its own heading, intro copy, reduced-motion note, and the style picker plus preview CarSurCom. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


							<div className='set-subsection-h'>Completion celebration</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Completion celebration". */ }

							<p className='settings-sub'>Pick which animation will play when all tasks are marked as completed inside of the Today page.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the celebration picker. */ }

							{ motNotFun( 'celebrations' ) }{ /* What: Reduced Motion Note Call. Why: A user who prefers reduced motion needs to know this animation won't play on its own, only on demand here. How: This renders motNotFun's own note, naming "celebrations", or nothing while redMotBoo is false. */ }

							<CarSurCom
								className='style-radio-card'

								isaPadBoo={ false }
							>{ /* What: Card Surface Component. Why: The style picker and its live preview stage need a shared, unpadded bordered container. How: This wraps StyRadCom and CelPreCom together. */ }


								<StyRadCom
									groLabStr='Completion celebration'
									groNamStr='completionStyle'
									radOptArr={ [ // What: Celebration Option Array. Why: The celebration picker needs one row per supported completion style. How: Each entry follows StyRadCom's own { valStr, labStr, hinStr } option shape.


										{ labStr : 'Confetti', valStr : 'confetti', hinStr : 'A burst of accent-colored confetti drifts out across your cards.' }, // What: Confetti Option Object. Why: This is the default celebration style. How: This names and describes the confetti burst.
										{ labStr : 'Ripple',   valStr : 'ripple',   hinStr : 'The progress ring ripples, and each card exhales in turn.' },        // What: Ripple Option Object. Why: This is a quieter alternative to confetti. How: This names and describes the ring ripple.
										{ labStr : 'Sparkle',  valStr : 'sparkle',  hinStr : 'Soft accent-colored sparkles twinkle briefly across your cards.' }   // What: Sparkle Option Object. Why: This is a softer alternative to confetti. How: This names and describes the sparkle twinkle.


									] }
									value={ ( staAppObj.appearance && staAppObj.appearance.completionStyle ) || 'confetti' }

									onChange={ actStoObj.setCelFun }
									onPreStyFun={ plaCelFun }
								/>{ /* What: Style Radio Component. Why: This is the actual celebration-style picker. How: This is bound to the persisted completionStyle, saving via actStoObj.setCelFun and previewing via plaCelFun. */ }



								<CelPreCom
									repTokNum={ celTokNum }
									styKeyStr={ celStyStr }
								/>{ /* What: Celebration Preview Component. Why: The user should be able to actually watch each celebration style before committing to it. How: This plays celStyStr, replaying every time celTokNum bumps. */ }


							</CarSurCom>


						</div>

						<div
							className='set-subsection set-subsection--pickanim'

							data-element-name-hook='picAniDiv'
						>{ /* What: Pickanim Subsection Div Element. Why: The picker-animation style picker needs its own labeled subsection. How: This wraps its own heading, intro copy, reduced-motion note, and the style picker plus preview CarSurCom. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


							<div className='set-subsection-h'>Picker animation</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Picker animation". */ }

							<p className='settings-sub'>Pick which animation will play when the &ldquo;Pick One&rdquo; button is clicked inside of the Pickers page.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the picker-animation picker. */ }

							{ motNotFun( 'this animation' ) }{ /* What: Reduced Motion Note Call. Why: A user who prefers reduced motion needs to know this animation won't play on its own, only on demand here. How: This renders motNotFun's own note, naming "this animation", or nothing while redMotBoo is false. */ }

							<CarSurCom
								className='style-radio-card'

								isaPadBoo={ false }
							>{ /* What: Card Surface Component. Why: The style picker and its live preview stage need a shared, unpadded bordered container. How: This wraps StyRadCom and PicAniCom together. */ }


								<StyRadCom
									groLabStr='Picker animation'
									groNamStr='pickAnim'
									radOptArr={ [ // What: Picker Animation Option Array. Why: The picker-animation picker needs one row per supported reveal style. How: Each entry follows StyRadCom's own { valStr, labStr, hinStr } option shape.


										{ labStr : 'Reel',      valStr : 'reel',      hinStr : 'Candidates cycle past like a slot-machine reel before landing on the pick.' }, // What: Reel Option Object. Why: This is the default reveal style. How: This names and describes the slot-machine reel.
										{ labStr : 'Spotlight', valStr : 'spotlight', hinStr : 'A spotlight sweeps across the candidates and settles on the pick.' },          // What: Spotlight Option Object. Why: This is an alternative reveal that keeps every candidate in view. How: This names and describes the sweeping spotlight.
										{ labStr : 'Dissolve',  valStr : 'dissolve',  hinStr : 'Candidates crossfade in place, dissolving into the final pick.' }              // What: Dissolve Option Object. Why: This is the calmest reveal style. How: This names and describes the in-place crossfade.


									] }
									value={ ( staAppObj.appearance && staAppObj.appearance.pickAnim ) || 'reel' }

									onChange={ ( newValStr ) => { // What: Picker Animation Change Handler. Why: Choosing a new style must also drop any stale preview, so the stage shows the newly selected style. How: This clears picPreStr, then saves the new style.


										setPicPreStr( null ); // What: Picker Preview Clear. Why: A leftover preview would otherwise keep overriding the newly selected style. How: This resets picPreStr back to null.

										actStoObj.setAniFun( newValStr ); // What: Picker Animation Save Call. Why: This is the actual persisted setting change. How: This calls actStoObj.setAniFun with newValStr.


									} }
									onPreStyFun={ plaPicFun }
								/>{ /* What: Style Radio Component. Why: This is the actual picker-animation style picker. How: This is bound to the persisted pickAnim, saving via actStoObj.setAniFun (clearing any stale preview first) and previewing via plaPicFun. */ }



								<PicAniCom
									repTokNum={ picTokNum }
									styKeyStr={ picPreStr || ( staAppObj.appearance && staAppObj.appearance.pickAnim ) || 'reel' }
								/>{ /* What: Picker Animation Component. Why: The user should be able to actually watch each picker-animation style before committing to it. How: This plays picPreStr while a preview is active, otherwise the selected pickAnim, replaying every time picTokNum bumps. */ }


							</CarSurCom>


						</div>

						<div
							className='set-subsection set-subsection--layout'

							data-element-name-hook='setLayDiv'
						>{ /* What: Layout Subsection Div Element. Why: The tab-bar-placement control needs its own labeled subsection. How: This wraps its own heading, intro copy, and the placement row's own CarSurCom. Its data-element-name-hook is read by help mode's Settings catalog. */ }


							<div className='set-subsection-h'>Layout</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Layout". */ }

							<p className='settings-sub'>Pick where the app&rsquo;s main navigation links should be located.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the placement control. */ }



							<CarSurCom>{ /* What: Card Surface Component. Why: The placement row needs the same bordered container as every other row in this tab. How: This wraps the placement row below. */ }


								<div
									className='set-data-row'

									data-element-name-hook='setRowDiv'
								>{ /* What: Layout Row Div Element. Why: The label/description and the SegConCom control need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the SegConCom control. Its data-element-name-hook is read by help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: Layout Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the control. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Tab bar placement</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Tab bar placement". */ }

										<span
											key={ ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom' }

											className='set-data-sub set-sub-fade set-layout-sub'
										>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the selected placement, and should fade between versions. How: This remounts (via its own placement key) and renders whichever of 3 explanatory sentences matches the current placement. */ }


											{ ( ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom' ) === 'bottom' ? ( // What: Bottom Placement Check. Why: The description names wherever the tab bar currently sits. How: This renders the bottom copy while tabPlacement is 'bottom' (or unset).


												<React.Fragment>The main navigation is now a floating bar towards the <strong>bottom of the screen</strong>.</React.Fragment> // What: Bottom Copy Fragment Element. Why: This describes the default floating bottom bar. How: This renders fixed copy with the location in bold.


											) : ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) === 'side' ? ( // What: Side Placement Check. Why: A side placement needs its own description. How: This renders the side copy while tabPlacement is 'side'.


												<React.Fragment>The main navigation is now a sidebar on the <strong>left side of the screen</strong>.</React.Fragment> // What: Side Copy Fragment Element. Why: This describes the vertical sidebar placement. How: This renders fixed copy with the location in bold.


											) : ( // What: Top Placement Branch. Why: The only remaining placement is the top bar. How: This renders the else branch, taken while tabPlacement is 'top'.


												<React.Fragment>The main navigation is now a bar at the <strong>top of the screen</strong>.</React.Fragment> // What: Top Copy Fragment Element. Why: This describes the top bar placement. How: This renders fixed copy with the location in bold.


											) }


										</span>


									</div>



									<SegConCom
										ariLabStr='Tab bar placement'
										optIteArr={ [ // What: Placement Option Array. Why: The segmented control needs one button per supported tab-bar placement. How: Each entry's own keyStr is compared against the current tabPlacement and written back on selection, while its labStr is the button's own visible text.


											{ keyStr : 'bottom', labStr : 'Bottom' }, // What: Bottom Option Object. Why: This is the tab bar's own default placement. How: This names the floating bottom bar.
											{ keyStr : 'side',   labStr : 'Side'   }, // What: Side Option Object. Why: This puts the tab bar in a vertical rail instead. How: This names the sidebar placement.
											{ keyStr : 'top',    labStr : 'Top'    }  // What: Top Option Object. Why: This puts the tab bar above the page content instead. How: This names the top bar placement.


										] }
										value={ ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom' }

										onChange={ actStoObj.setPlaFun }
									/>{ /* What: Segment Control Component. Why: This is the actual 3-way exclusive control for the tab-bar placement. How: This is bound to the persisted tabPlacement, saving via actStoObj.setPlaFun. */ }


								</div>


							</CarSurCom>


						</div>


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'daily' ] = secCurEle; } }

						className='set-section set-section--daily'

						data-element-name-hook='setDaiSec'
					>{ /* What: Daily Section Element. Why: This is the Daily generator section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the generator's own settings CarSurCom. Its data-element-name-hook is read by the Settings page tour, the App Features tours, and help mode's Settings catalog. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Daily generator</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Daily generator". */ }


						</div>

						<p className='settings-sub'>The Daily generator can always be run manually from the Today page regardless of this setting. Which pickers are included in the Daily generator can be found with their own settings in the Data page.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for the Daily generator. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: The auto-run toggle, its run-time row, and the notify-me row all share one bordered container. How: This wraps all 3 rows below. */ }


							<div
								className='set-data-row'

								data-element-name-hook='setRowDiv'
							>{ /* What: Auto Run Row Div Element. Why: The label/description and the switch need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the switch button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Auto Run Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the switch. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Run automatically</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Run automatically". */ }

									<span
										key={ daiModStr + ( staAppObj.daily && staAppObj.daily.runTime ) }

										className='set-data-sub set-sub-fade'
									>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the mode and run time, and should fade between versions. How: This remounts (via its own mode+time key) and renders one of 2 explanatory sentences depending on daiModStr. */ }


										{ daiModStr === 'auto' ? ( // What: Auto Mode Check. Why: The description reads differently depending on whether the generator runs on its own. How: This renders the scheduled copy while daiModStr is 'auto', otherwise the manual copy.


											<React.Fragment>Daily generator will run automatically every day at <strong>{ forRunFun( ( staAppObj.daily && staAppObj.daily.runTime ) || '04:00' ) }</strong>.</React.Fragment> // What: Scheduled Copy Fragment Element. Why: This tells the user exactly when the generator will next run. How: This renders the formatted run time in bold via forRunFun.


										) : ( // What: Manual Mode Branch. Why: With auto mode off, the generator only runs by hand. How: This renders the else branch, taken while daiModStr is 'manual'.


											<React.Fragment>Daily generator can only be run <strong>manually</strong> via the generator button at the bottom of the Today page.</React.Fragment> // What: Manual Copy Fragment Element. Why: This points the user at the manual generator button instead. How: This renders fixed copy with "manually" in bold.


										) }


									</span>


								</div>

								<button
									className={ ` switch   ${ daiModStr === 'auto' ? 'is-on' : '' } ` }

									aria-label='Run the Daily generator automatically'
									aria-pressed={ daiModStr === 'auto' }

									onClick={ () => actStoObj.daiModFun( daiModStr === 'auto' ? 'manual' : 'auto' ) }
								>{ /* What: Auto Run Switch Button Element. Why: This is the actual control that flips between automatic and manual generator runs. How: This calls actStoObj.daiModFun with the toggled value when clicked. */ }


									<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


								</button>


							</div>


							<div
								className={ ` set-data-row   set-data-row--sub   ${ daiModStr === 'auto' ? '' : 'is-disabled' } ` }

								data-element-name-hook='runTimDiv'
							>{ /* What: Run Time Row Div Element. Why: The run-time input is only meaningful while auto mode is on, so this whole row visually disables itself otherwise. How: This wraps the info block and the time input. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Run Time Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the input. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Run automatically at</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Run automatically at". */ }

									<span
										key={ daiModStr }

										className='set-data-sub set-sub-fade'
									>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the mode, and should fade between versions. How: This remounts (via its own mode key) and renders one of 2 explanatory sentences depending on daiModStr. */ }


										{ daiModStr === 'auto' ? 'A quiet, early hour works best so that your list is ready for you first thing in the morning.' : 'Auto generation is turned off, turn it on to modify this setting.' }{ /* What: Run Time Copy Expression. Why: The run-time row explains itself differently depending on whether it is editable. How: This renders a scheduling tip while daiModStr is 'auto', otherwise a note that the setting is disabled. */ }


									</span>


								</div>

								<input
									className='np-input set-time-input'

									disabled={ daiModStr !== 'auto' }
									type='time'
									value={ ( staAppObj.daily && staAppObj.daily.runTime ) || '04:00' }

									aria-label='Daily generator run time'

									onChange={ ( chaEveObj ) => onRunChaFun( chaEveObj.target.value ) }
									onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); } }
								/>{ /* What: Run Time Input Element. Why: This is the actual control for the generator's own scheduled run time. How: This is bound to the persisted runTime, saving (and asking notification permission once) via onRunChaFun. */ }


							</div>


							{ daiModStr === 'auto' && notPerStr !== 'unsupported' && ( // What: Notify Row Visibility Check. Why: The notify-me row only makes sense while the generator actually runs automatically, and only in an environment that supports notifications at all. How: This renders the whole row only while both conditions hold.


								<div
									className='set-data-row set-notify-row'

									data-element-name-hook='notRowDiv'
								>{ /* What: Notify Row Div Element. Why: The label/description and the permission control need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and whichever of the 3 permission-state controls below applies. Its data-element-name-hook is read by help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: Notify Info Div Element. Why: The row's own name and its permission-dependent description need their own grouping, apart from the control. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Notify me when it runs</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Notify me when it runs". */ }

										<span className='set-data-sub'>{ /* What: Set Data Sub Span Element. Why: This row's own description depends on the real current notification permission. How: This renders one of 3 explanatory sentences depending on notPerStr. */ }


											{ notPerStr === 'granted' ? ( // What: Granted Permission Check. Why: The description depends on the real current notification permission. How: This renders the granted copy while notPerStr is 'granted'.


												<React.Fragment>You&rsquo;ll get a notification once your list has been generated but only while the app is open in a tab or window. Notifications for a closed app are coming in a future release.</React.Fragment> // What: Granted Copy Fragment Element. Why: This explains what a granted permission actually delivers. How: This renders fixed copy about open-app-only notifications.


											) : notPerStr === 'denied' ? ( // What: Denied Permission Check. Why: A blocked permission needs its own explanation. How: This renders the denied copy while notPerStr is 'denied'.


												<React.Fragment>Notifications are blocked for this site. You&rsquo;ll need to allow them in your browser&rsquo;s site settings.</React.Fragment> // What: Denied Copy Fragment Element. Why: The app can't re-ask once blocked, so the user needs to know where to fix it. How: This renders fixed copy pointing at the browser's own site settings.


											) : ( // What: Default Permission Branch. Why: Permission hasn't been decided either way yet. How: This renders the else branch, taken while notPerStr is 'default'.


												<React.Fragment>Get a nudge once your list has been generated. Only works while the app is open in a tab or window.</React.Fragment> // What: Default Copy Fragment Element. Why: This pitches the feature before permission is asked. How: This renders fixed copy describing the nudge.


											) }


										</span>


									</div>



									{ notPerStr === 'default' && ( // What: Enable Button Check. Why: An Enable button only makes sense while permission has not yet been decided either way. How: This renders the ButBasCom only while notPerStr is 'default'.


										<ButBasCom
											kinValStr='secondary'
											sizValStr='sm'

											onClick={ enaNotFun }
										>Enable</ButBasCom> // What: Button Base Component. Why: This is the actual explicit request for notification permission. How: This calls enaNotFun when clicked.


									) }



									{ notPerStr === 'granted' && ( // What: Granted Chip Check. Why: A granted state deserves a small positive confirmation instead of an action button. How: This renders the chip only while notPerStr is 'granted'.


										<span className='set-store-chip is-ok'>On</span> // What: Set Store Chip Span Element. Why: This is the actual granted-state confirmation. How: This renders the fixed text "On".


									) }

									{ notPerStr === 'denied' && ( // What: Blocked Chip Check. Why: A denied state deserves a small warning confirmation instead of an action button, since it cannot be re-requested by this app. How: This renders the chip only while notPerStr is 'denied'.


										<span className='set-store-chip is-warn'>Blocked</span> // What: Set Store Chip Span Element. Why: This is the actual denied-state confirmation. How: This renders the fixed text "Blocked".


									) }


								</div>


							) }


						</CarSurCom>


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'holidays' ] = secCurEle; } }

						className='set-section set-section--holidays'

						data-element-name-hook='setHolSec'
					>{ /* What: Holidays Section Element. Why: This is the Holidays section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and HolEdiCom's own CarSurCom. Its data-element-name-hook is read by the Settings page tour. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Holidays</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Holidays". */ }


						</div>

						<p className='settings-sub'>Any pickers that are set to &ldquo;Skip on holidays&rdquo; will not be run on the days that are toggled on here. Toggle off any that you don&rsquo;t observe, or even add your own! Dates shown are for { new Date().getFullYear() }.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Holidays, inlining the real current year. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: The whole holiday list and its add-form need a shared bordered container. How: This wraps HolEdiCom. */ }


							<HolEdiCom
								actStoObj={ actStoObj }
								staAppObj={ staAppObj }
							/>{ /* What: Holiday Editor Component. Why: The holiday list and its add-form are substantial enough to live in their own component. How: This renders it, driven by the same shared state/actions this whole tab receives. */ }


						</CarSurCom>


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'data' ] = secCurEle; } }

						className='set-section set-section--data'

						data-element-name-hook='setDatSec'
					>{ /* What: Data Section Element. Why: This is the Data control section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the whole storage/export/import/reset CarSurCom. Its data-element-name-hook is read by the Settings page tour. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Data control</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Data control". */ }


						</div>

						<p className='settings-sub'>All of your data is stored locally, on this device to do with it as you will. Unfortunately, this also means that if you want to use this app on a different device then you will need to export your data here, and then use the import feature on the other device. Exporting your data is also a good way to backup your data, just in case something were to happen either to your device or to the browser and its stored data.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Data control. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: The storage-status row, the platform-specific install notes, and the export/import/reset rows all share one bordered container. How: This wraps every row below. */ }


							<div
								className='set-data-row set-store-row'

								data-element-name-hook='stoRowDiv'
							>{ /* What: Store Row Div Element. Why: The storage-status label/facts and the install/protect actions need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the store-actions block. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Store Info Div Element. Why: The row's own name, description, fact chips, and any persist-result message all need their own grouping. How: This wraps the name span, the description span, the facts span, and (conditionally) the persist-message span. */ }


									<span className='set-data-name'>Where your data lives</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Where your data lives". */ }

									<span className='set-data-sub'>{ /* What: Set Data Sub Span Element. Why: This row's own description depends on which storage engine is actually in use. How: This renders one of 2 explanatory sentences depending on stoStaObj's own engine field. */ }


										{ stoStaObj && stoStaObj.engine === 'idb' ? ( // What: Database Engine Check. Why: The description depends on which storage engine is actually in use. How: This renders the database copy while stoStaObj reports the 'idb' engine.


											<React.Fragment>Stored in this browser&rsquo;s database on this device.</React.Fragment> // What: Database Copy Fragment Element. Why: This confirms the sturdier IndexedDB storage is in use. How: This renders fixed copy.


										) : ( // What: Simple Storage Branch. Why: Without IndexedDB, data falls back to the easier-to-clear localStorage. How: This renders the else branch, taken for any other engine or while status is still loading.


											<React.Fragment>Stored in this browser&rsquo;s simple storage on this device, which is more likely to be cleared automatically. Exporting a backup is worth doing.</React.Fragment> // What: Simple Storage Copy Fragment Element. Why: The user should know this storage is more fragile and that exporting helps. How: This renders fixed copy recommending a backup.


										) }


									</span>

									<span className='set-store-facts'>{ /* What: Store Facts Span Element. Why: The protected/size/mirror facts, plus an install confirmation, need their own grouping as a row of small chips. How: This wraps 3 always-shown chips plus an installed chip while isaStaBoo is true. */ }


										<span className={ ` set-store-chip   ${ stoStaObj && stoStaObj.persisted ? 'is-ok' : 'is-warn' } ` }>{ stoStaObj && stoStaObj.persisted ? 'Protected from cleanup' : 'Not protected yet' }</span>{ /* What: Persisted Chip Span Element. Why: Whether the browser has promised not to evict this app's own data is worth its own always-visible chip. How: This renders one of 2 labels, styled ok/warn, based on stoStaObj's own persisted field. */ }

										<span className='set-store-chip'>{ forBytFun( stoStaObj && stoStaObj.dataBytes ) } of your data</span>{ /* What: Size Chip Span Element. Why: How much data is actually stored is worth its own always-visible chip. How: This renders forBytFun's own formatted size, reading stoStaObj's own dataBytes field. */ }

										<span className={ ` set-store-chip   ${ stoStaObj && stoStaObj.mirrorOk === false ? 'is-warn' : '' } ` }>Fallback copy: { stoStaObj && stoStaObj.mirrorOk === false ? 'out of date' : forWheFun( stoStaObj && stoStaObj.mirrorAt ) }</span>{ /* What: Mirror Chip Span Element. Why: How fresh the localStorage fallback mirror is worth its own always-visible chip. How: This renders either a warning or forWheFun's own formatted timestamp, reading stoStaObj's own mirrorOk/mirrorAt fields. */ }

										{ isaStaBoo && ( // What: Installed Chip Check. Why: An installed/standalone app deserves its own small confirmation chip alongside the others. How: This renders the chip only while isaStaBoo is true.


											<span className='set-store-chip is-ok'>Installed</span> // What: Installed Chip Span Element. Why: This is the actual installed confirmation. How: This renders the fixed text "Installed".


										) }


									</span>

									{ perMesObj && ( // What: Persist Message Check. Why: A message should only exist right after an actual Install/Protect Data attempt. How: This renders the message span only while perMesObj holds a value.


										<span
											className={ ` set-import-msg   ${ perMesObj.okaBoo ? 'is-ok' : 'is-err' } ` }

											role='status'
										>{ perMesObj.texStr }</span> // What: Persist Message Span Element. Why: This is the actual outcome text from the last Install/Protect Data attempt. How: This renders perMesObj's own text field, styled ok/err based on its own ok field.


									) }


								</div>

								<div className='set-store-actions'>{ /* What: Store Actions Div Element. Why: The Install and Protect Data buttons need their own grouping, apart from the info block. How: This conditionally renders whichever of the 3 buttons currently applies. */ }


									{ canInsBoo && ( // What: Install Button Check. Why: An Install button should only ever show while a real install prompt is actually available. How: This renders the ButBasCom only while canInsBoo is true.


										<ButBasCom
											className='set-install-btn'

											data-element-name-hook='insAppBut'

											icoNamStr='dowEle'
											kinValStr='primary'
											sizValStr='sm'

											onClick={ onInsAppFun }
										>Install app</ButBasCom> // What: Button Base Component. Why: This is the actual trigger for the native install prompt. How: This calls onInsAppFun when clicked. Its data-element-name-hook is read by the App Features tours.


									) }



									{ insStaStr === 'pending' && ( // What: Pending Install Button Check. Why: While it is not yet known whether an install prompt will become available, a disabled placeholder avoids a layout jump. How: This renders a disabled ButBasCom only while insStaStr is 'pending'.


										<ButBasCom
											disabled
											icoNamStr='dowEle'
											kinValStr='secondary'
											sizValStr='sm'
										>Install app</ButBasCom> // What: Button Base Component. Why: This is a disabled placeholder shown only until install support is actually known one way or the other. How: This renders with no onClick at all, since it is always disabled.


									) }



									{ !( stoStaObj && stoStaObj.persisted ) && ( // What: Protect Data Button Check. Why: The Protect Data button only makes sense while persistence has not already been granted. How: This renders the ButBasCom only while stoStaObj reports persisted as falsy (or is not yet loaded).


										<ButBasCom
											className='set-protect-btn'

											data-element-name-hook='proDatBut'

											kinValStr='secondary'
											sizValStr='sm'

											onClick={ onProDatFun }
										>Protect Data</ButBasCom> // What: Button Base Component. Why: This is the actual trigger for the storage-persistence request. How: This calls onProDatFun when clicked. Its data-element-name-hook is read by the App Features tours.


									) }


								</div>


							</div>


							{ insStaStr === 'installed' && ( // What: Already Installed Note Check. Why: A user viewing this in a plain browser tab, while an installed copy already exists, should be pointed at that installed copy instead. How: This renders the note only while insStaStr is 'installed'.


								<div
									className='set-data-row set-store-ios'

									data-element-name-hook='insRowDiv'
								>{ /* What: Already Installed Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: Already Installed Info Div Element. Why: The note's own name and explanation need their own grouping. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Already installed on this device</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Already installed on this device". */ }

										<span className='set-data-sub'>You&rsquo;re viewing Ease My Life in a browser tab. Open the installed app from your home screen or app list instead. It&rsquo;s the same data, and the installed copy is the one protected from browser cleanup.</span>{ /* What: Set Data Sub Span Element. Why: The user needs a clear, actionable explanation of why they are seeing this note. How: This renders the fixed explanatory copy. */ }


									</div>


								</div>


							) }


							{ insStaStr === 'unsupported' && !iosInsBoo && !macInsBoo && ( // What: Unsupported Note Check. Why: A browser with no install prompt and no iOS/macOS-specific instructions still deserves guidance. How: This renders the note only while all 3 conditions hold.


								<div
									className='set-data-row set-store-ios'

									data-element-name-hook='insRowDiv'
								>{ /* What: Unsupported Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: Unsupported Info Div Element. Why: The note's own name and explanation need their own grouping. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Installing from this page isn&rsquo;t available here</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Installing from this page isn't available here". */ }

										<span className='set-data-sub'>Some browsers offer <strong>Install app</strong> or <strong>Add to Home screen</strong> in their own menu, so it&rsquo;s worth a look. Others, including Firefox on desktop, can&rsquo;t install web apps at all. There you&rsquo;d need a Chromium based browser such as Chrome or Edge. Either way you can keep using Ease My Life right here, just use the <strong>Protect Data</strong> control above to make this browser far less likely to clear it.</span>{ /* What: Set Data Sub Span Element. Why: The user needs a clear explanation of why no install option is showing, plus the next-best alternative. How: This renders the fixed explanatory copy. */ }


									</div>


								</div>


							) }


							{ iosInsBoo && ( // What: iOS Install Note Check. Why: iOS/iPadOS need their own distinct install instructions and data-migration warning. How: This renders the note only while iosInsBoo is true.


								<div
									className='set-data-row set-store-ios'

									data-element-name-hook='insRowDiv'
								>{ /* What: iOS Install Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: iOS Install Info Div Element. Why: The note's own name and its 2 explanatory paragraphs need their own grouping. How: This wraps the name span and 2 description spans. */ }


										<span className='set-data-name'>Add to your Home Screen</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Add to your Home Screen". */ }

										<span className='set-data-sub'>On iPhone and iPad, tap <strong>Share</strong> then <strong>Add to Home Screen</strong>. Do this and Safari stops clearing your data when the app sits unused. Without it, everything here can be wiped after a period of not opening the app.</span>{ /* What: Set Data Sub Span Element. Why: The user needs the actual step-by-step instructions for this platform. How: This renders the fixed instructional copy. */ }

										<span className='set-data-sub'><strong>WARNING:</strong> iOS and iPadOS do not copy over your existing data when installing the app. Please use the Export feature below to export your data and then import your data back in using the Import feature.</span>{ /* What: Set Data Sub Span Element. Why: This platform's own install flow does not carry over existing data, and that is a genuinely destructive surprise worth its own separate warning. How: This renders the fixed warning copy. */ }


									</div>


								</div>


							) }


							{ macInsBoo && ( // What: Mac Install Note Check. Why: macOS Safari needs its own distinct install instructions and data-migration warning. How: This renders the note only while macInsBoo is true.


								<div
									className='set-data-row set-store-ios'

									data-element-name-hook='insRowDiv'
								>{ /* What: Mac Install Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


									<div className='set-data-info'>{ /* What: Mac Install Info Div Element. Why: The note's own name and its 2 explanatory paragraphs need their own grouping. How: This wraps the name span and 2 description spans. */ }


										<span className='set-data-name'>Add to your Dock</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Add to your Dock". */ }

										<span className='set-data-sub'>On Mac, open Safari&rsquo;s <strong>File</strong> menu and choose <strong>Add to Dock</strong>. Do this and Safari stops clearing your data when the app sits unused. Without it, everything here can be wiped after a period of not opening the app.</span>{ /* What: Set Data Sub Span Element. Why: The user needs the actual step-by-step instructions for this platform. How: This renders the fixed instructional copy. */ }

										<span className='set-data-sub'><strong>WARNING:</strong> macOS does not copy over your existing data when installing the app. Please use the Export feature below to export your data and then import your data back in using the Import feature.</span>{ /* What: Set Data Sub Span Element. Why: This platform's own install flow does not carry over existing data, and that is a genuinely destructive surprise worth its own separate warning. How: This renders the fixed warning copy. */ }


									</div>


								</div>


							) }


							<div
								className='set-data-row set-export-row'

								data-element-name-hook='expRowDiv'
							>{ /* What: Export Row Div Element. Why: The export label/description and the Export button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Export control. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Export Info Div Element. Why: The row's own name, description, and any post-export message all need their own grouping. How: This wraps the name span, the description span, and (conditionally) the export-message span. */ }


									<span className='set-data-name'>Export a backup</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Export a backup". */ }

									<span className='set-data-sub'>Downloads a JSON file of everything, this includes <strong>{ picCouNum }</strong> pickers, <strong>{ iteCouNum }</strong> items, <strong>{ remCouNum }</strong> reminders and <strong>all app settings</strong>.</span>{ /* What: Set Data Sub Span Element. Why: The row's own description should say exactly what a backup would include right now. How: This renders the fixed description, inlining the live picCouNum/iteCouNum/remCouNum counts. */ }

									{ expMesObj && ( // What: Export Message Check. Why: A message should only exist right after an actual export just happened. How: This renders the message span only while expMesObj holds a value.


										<span
											key={ expMesObj.timNum }

											className='set-import-msg is-ok'
										>Backup exported, including <strong>{ expMesObj.entNum }</strong> history { expMesObj.entNum === 1 ? 'entry' : 'entries' }.</span> // What: Export Message Span Element. Why: This is the actual confirmation text from the last export. How: This renders expMesObj's own entries count, pluralized correctly for exactly 1 entry.


									) }


								</div>



								{ hasDatBoo ? ( // What: Has Data Check. Why: A working Export trigger only makes sense while there's actually something to export. How: This renders the working Export button while hasDatBoo is true, an explained disabled one otherwise.


									<ButBasCom
										ref={ expButRef }

										icoNamStr='dowEle'
										kinValStr='secondary'
										sizValStr='sm'

										onClick={ expDatFun }
									>Export</ButBasCom> // What: Button Base Component. Why: This is the actual trigger for building and downloading the backup. How: This calls expDatFun when clicked.


								) : ( // What: No Data Branch. Why: With no data at all, the Export trigger needs to explain why it's disabled instead of silently doing nothing. How: This renders the else branch, taken while hasDatBoo is false.


									<InfTipCom
										className='set-disabled-btn'

										labTexStr='There is no user data to export.'
									>{ /* What: Info Tip Component. Why: A disabled Export button still needs to explain, on hover/focus, exactly why it is disabled. How: This wraps a disabled ButBasCom, shown only while hasDatBoo is false. */ }


										<ButBasCom
											disabled
											icoNamStr='dowEle'
											kinValStr='secondary'
											sizValStr='sm'
										>Export</ButBasCom>{ /* What: Button Base Component. Why: This is the disabled Export button the tip explains. How: This renders with no onClick at all, since it is always disabled. */ }


									</InfTipCom>


								) }


							</div>


							<div
								className='set-data-row set-import-row'

								data-element-name-hook='impRowDiv'
							>{ /* What: Import Row Div Element. Why: The import label/description and the Import control (or its confirm pair) need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block, the hidden file input, and whichever of the trigger/confirm controls currently applies. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Import Info Div Element. Why: The row's own name, description, and any pending/completed message all need their own grouping. How: This wraps the name span, the description span, and whichever message span currently applies. */ }


									<span className='set-data-name'>Import a backup</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Import a backup". */ }

									<span className='set-data-sub'><strong>Replaces all data</strong> that is currently being stored by this app with a previously exported file.</span>{ /* What: Set Data Sub Span Element. Why: The destructive nature of import needs to be stated plainly up front. How: This renders the fixed description. */ }

									{ penImpObj && ( // What: Pending Import Message Check. Why: A confirmation prompt should only exist while a backup is actually staged and awaiting confirmation. How: This renders the message span only while penImpObj holds a value.


										<span
											id='set-import-confirm-msg'

											className='set-import-msg is-warn'
										>Import <strong>{ penImpObj.namStr }</strong>? This <strong>replaces all data</strong> currently stored by this app.</span> // What: Pending Import Message Span Element. Why: This is the actual confirmation prompt, naming the staged file. How: This renders penImpObj's own name, and is referenced by the confirm button's own aria-describedby below.


									) }

									{ !penImpObj && impMesObj && ( // What: Import Outcome Message Check. Why: A completed (or failed) message should only show once no confirmation is currently pending. How: This renders the message span only while both conditions hold.


										<span className={ ` set-import-msg   ${ impMesObj.okaBoo ? 'is-ok' : 'is-err' } ` }>{ impMesObj.texStr }</span> // What: Import Outcome Message Span Element. Why: This is the actual outcome text from the last import attempt. How: This renders impMesObj's own text, styled ok/err based on its own ok field.


									) }


								</div>

								<input
									ref={ filInpRef }

									style={{ display : 'none' }}

									accept='application/json,.json'
									type='file'

									aria-label='Import a backup file'

									onChange={ onImpFilFun }
								/>{ /* What: File Input Element. Why: A real, native file picker is required to choose a backup file; it stays hidden since the Import ButBasCom below is what the user actually sees. How: This is triggered indirectly via filInpRef.current.click() and handled by onImpFilFun. */ }



								{ penImpObj ? ( // What: Pending Import Check. Why: A staged backup awaiting confirmation replaces the plain Import trigger with its own confirm pair. How: This renders the confirm pair while penImpObj holds a value, the plain trigger otherwise.


									<div className={ ` set-reset-confirm   ${ impLeaBoo ? 'is-leaving' : '' } ` }>{ /* What: Import Confirm Div Element. Why: The Import/Cancel confirm pair needs its own grouping, replacing the single Import trigger while a backup is staged. How: This wraps the confirm's own Import and Cancel buttons. */ }


										<ButBasCom
											ref={ impConRef }

											kinValStr='danger'
											sizValStr='sm'

											aria-describedby='set-import-confirm-msg'

											onClick={ runImpFun }
										>Import</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final confirmation that replaces all data with the staged backup. How: This calls runImpFun when clicked. */ }



										<ButBasCom
											kinValStr='ghost'
											sizValStr='sm'

											onClick={ canImpFun }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The confirmation needs an explicit way to back out without importing. How: This calls canImpFun when clicked. */ }


									</div>


								) : ( // What: Plain Import Branch. Why: With nothing staged yet, the row just needs its normal clickable trigger. How: This renders the else branch, taken while penImpObj is null.


									<ButBasCom
										ref={ impButRef }

										icoNamStr='uplEle'
										kinValStr='secondary'
										sizValStr='sm'

										onClick={ () => filInpRef.current && filInpRef.current.click() }
									>Import</ButBasCom> // What: Button Base Component. Why: This is the actual trigger that opens the native file picker. How: This calls the hidden file input's own click() when clicked.


								) }


							</div>


							<div
								className='set-data-row set-data-row--danger set-reset-row'

								data-element-name-hook='resRowDiv'
							>{ /* What: Reset Row Div Element. Why: The reset label/description and the Reset control (or its confirm pair) need to sit in the tab's usual info-plus-action row layout, flagged as a dangerous action. How: This wraps the info block and whichever of the trigger/confirm/disabled controls currently applies. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Reset Info Div Element. Why: The row's own name, description, and any post-reset message all need their own grouping. How: This wraps the name span, the description span, and (conditionally) the reset-message span. */ }


									<span className='set-data-name'>Reset all data</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Reset all data". */ }

									<span
										id='set-reset-confirm-msg'

										className='set-data-sub'
									>Wipes everything and restores the app to a clean state. <strong>This can&rsquo;t be undone.</strong></span>{ /* What: Set Data Sub Span Element. Why: The destructive and irreversible nature of reset needs to be stated plainly up front, and is also referenced by the confirm button's own aria-describedby below. How: This renders the fixed description. */ }

									{ resMesStr && ( // What: Reset Message Check. Why: A message should only exist right after an actual reset just happened. How: This renders the message span only while resMesStr holds a value.


										<span
											key={ resMesStr }

											className='set-import-msg is-ok'

											role='status'
										>{ resMesStr }</span> // What: Reset Message Span Element. Why: This is the actual confirmation text from the last reset. How: This renders resMesStr directly.


									) }


								</div>



								{ conResBoo ? ( // What: Reset Confirm Check. Why: An in-progress reset confirmation replaces the trigger with its own Reset/Cancel pair. How: This renders the confirm pair while conResBoo is true.


									<div className={ ` set-reset-confirm   ${ resLeaBoo ? 'is-leaving' : '' } ` }>{ /* What: Reset Confirm Div Element. Why: The Reset/Cancel confirm pair needs its own grouping, replacing the single Reset trigger while confirmation is pending. How: This wraps the confirm's own Reset and Cancel buttons. */ }


										<ButBasCom
											ref={ resConRef }

											kinValStr='danger'
											sizValStr='sm'

											aria-describedby='set-reset-confirm-msg'

											onClick={ () => { // What: Reset Confirm Click Handler. Why: Confirming wipes every piece of data, so it also has to land the user somewhere sensible and report what happened. How: This navigates home, wipes the store, closes the confirm pair, and announces the outcome.


												if ( onNavHomFun ) onNavHomFun(); // What: Navigate Home Call. Why: The post-reset welcome modal's own tour anchors only exist on the Today tab. How: This calls onNavHomFun, if provided, before the reset itself actually runs. // Land on Today FIRST: the clean state re-opens the welcome modal, and its tour anchors only exist on the Today tab. Starting the tour from Settings left it dimmed with no coach.



												actStoObj.wipAppFun(); // What: Wipe App Call. Why: This is the actual store mutation that resets every piece of data. How: This calls actStoObj.wipAppFun.

												setConResBoo( false );             // What: Confirm Close. Why: The confirm pair's job is done. How: This flips conResBoo back to false.
												setResLeaBoo( false );             // What: Reset Leaving Clear. Why: No leave animation should linger after a real reset. How: This flips resLeaBoo back to false.
												setResMesStr( 'All data reset.' ); // What: Reset Message Set. Why: The row should confirm the reset on screen. How: This writes a fixed confirmation into resMesStr.

												annStaFun( 'All data reset.' ); // What: Reset Announce Call. Why: A screen-reader user needs to hear the reset happened too, especially since no focus target remains here to imply it visually. How: This announces a fixed confirmation message. // Nothing here to return focus to (the row's own Reset button becomes disabled with no data), and the welcome modal takes focus on the Today tab, so just say what happened.


											} }
										>Reset</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final confirmation that wipes all data. How: This navigates home, resets the store, closes the confirm, and announces the outcome when clicked. */ }



										<ButBasCom
											kinValStr='ghost'
											sizValStr='sm'

											onClick={ cloResFun }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The confirmation needs an explicit way to back out without resetting. How: This calls cloResFun when clicked. */ }


									</div>


								) : hasDatBoo ? ( // What: Has Data Check. Why: A working Reset trigger only makes sense while there's actually something to reset. How: This renders the working Reset button while hasDatBoo is true, an explained disabled one otherwise.


									<ButBasCom
										ref={ resButRef }

										icoNamStr='refEle'
										kinValStr='danger'
										sizValStr='sm'

										onClick={ () => { // What: Reset Open Click Handler. Why: Pressing Reset should open the confirm pair without a stale message lingering beside it. How: This clears resMesStr, then opens the confirmation.


											setResMesStr( null ); // What: Reset Message Clear. Why: An older confirmation message shouldn't sit beside a fresh confirm. How: This resets resMesStr back to null.

											setConResBoo( true ); // What: Confirm Open. Why: This is what actually swaps in the confirm pair. How: This flips conResBoo to true.


										} }
									>Reset</ButBasCom> // What: Button Base Component. Why: This is the actual trigger that opens the reset confirmation. How: This clears any stale message and opens the confirm pair when clicked.


								) : ( // What: No Data Branch. Why: With no data at all, the Reset trigger needs to explain why it's disabled instead of silently doing nothing. How: This renders the else branch, taken while hasDatBoo is false.


									<InfTipCom
										className='set-disabled-btn'

										labTexStr='There is no user data to reset.'
									>{ /* What: Info Tip Component. Why: A disabled Reset button still needs to explain, on hover/focus, exactly why it is disabled. How: This wraps a disabled ButBasCom, shown only while there is no data and no confirm pending. */ }


										<ButBasCom
											disabled
											icoNamStr='refEle'
											kinValStr='danger'
											sizValStr='sm'
										>Reset</ButBasCom>{ /* What: Button Base Component. Why: This is the disabled Reset button the tip explains. How: This renders with no onClick at all, since it is always disabled. */ }


									</InfTipCom>


								) }


							</div>


						</CarSurCom>


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'account' ] = secCurEle; } }

						className='set-section set-section--account'

						data-element-name-hook='setAccSec'
					>{ /* What: Account Section Element. Why: This is the Account section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the sync-placeholder CarSurCom. Its data-element-name-hook is read by help mode's Settings catalog. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Account</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Account". */ }


						</div>

						<p className='settings-sub'>Ease My Life runs entirely on this device, with no account required. Sign in to sync across devices is planned for a future release as a paid feature (one time fee only).</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Account. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: The sync-placeholder row needs the same bordered container as every other row in this tab. How: This wraps the sync row below. */ }


							<div
								className='set-data-row'

								data-element-name-hook='setRowDiv'
							>{ /* What: Sync Row Div Element. Why: The label/description and the disabled placeholder button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the disabled ButBasCom. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Sync Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Sync across devices</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Sync across devices". */ }

									<span className='set-data-sub'>This feature will keep all of your Ease My Life data synced across every device that you sign in to.</span>{ /* What: Set Data Sub Span Element. Why: The row needs to explain what this not-yet-shipped feature will actually do. How: This renders the fixed description. */ }


								</div>



								<ButBasCom
									disabled
									kinValStr='secondary'
									sizValStr='sm'
								>Coming Soon</ButBasCom>{ /* What: Button Base Component. Why: A disabled placeholder communicates the feature exists without implying it works today. How: This renders with no onClick at all, since it is always disabled. */ }


							</div>


						</CarSurCom>


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'about' ] = secCurEle; } }

						className='set-section set-section--about'

						data-element-name-hook='setAboSec'
					>{ /* What: About Section Element. Why: This is the About section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy plus 4 Cards: the app identity, the support-the-project row, the replay-tour row, and ConSupCom. Its data-element-name-hook is read by the Settings page tour. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>About</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "About". */ }


						</div>

						<p className='settings-sub'>Ease My Life is a labor of love for me. I have been using a version of this app on my own home server for years, and I have always wanted to turn it into a &ldquo;proper app&rdquo; that I could share with everyone else. I hope there are at least a few people out there that find it as useful as I do. You can find out more information about myself by visiting the link below to my personal website, including links to some of my other projects.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading, and About's own is a longer personal note. How: This renders the fixed first paragraph. */ }

						<p className='settings-sub'>You will also find the link to this app&rsquo;s source code on GitHub. This is an open source project with an &ldquo;MIT + Non-Commercial&rdquo; Custom License which will allow anyone to freely fork and modify the project&rsquo;s source code, provided that attribution is included in your project and that you will not be selling the software or making money off it in any way. Please be responsible with the source code, because I am just one person maintaining the project in their free time trying to make a living. This is not some big company with vast resources trying to extract every dollar that they can.</p>{ /* What: Settings Sub Paragraph Element. Why: The license terms deserve their own separate paragraph from the personal note above. How: This renders the fixed second paragraph. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: The app's own name, version, and creator/GitHub links need a shared bordered container. How: This wraps the set-about div below. */ }


							<div
								className='set-about'

								data-element-name-hook='aboInfDiv'
							>{ /* What: Set About Div Element. Why: The brand name, version, and links all belong to one identity block. How: This wraps the brand span and the version/creator/GitHub spans. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-about-brand'>{ /* What: Set About Brand Div Element. Why: The brand name needs its own small wrapper, separate from the version/link lines below it. How: This wraps the single brand-name span. */ }


									<span className='set-about-name'>Ease My Life</span>{ /* What: Set About Name Span Element. Why: The identity block needs its own visible app name. How: This renders the fixed text "Ease My Life". */ }


								</div>

								<span className='set-about-ver'>{ APP_VER_STR == null ? 'Version: 1.0' : `Version: ${ APP_VER_STR }` }</span>{ /* What: Set About Ver Span Element. Why: The real build version belongs in this identity block. How: This renders APP_VER_STR, falling back to "1.0" when the build-time define is missing. */ }

								<span className='set-about-creator'>Creator: <a href='https://techgeek.support/' target='_blank' rel='noopener noreferrer'>https://techgeek.support/</a></span>{ /* What: Set About Creator Span Element. Why: The identity block links to the creator's own personal site. How: This renders a fixed external link, opened in a new tab. */ }

								<span className='set-about-creator'>GitHub: <a href='https://github.com/z4nta0/ease-my-life' target='_blank' rel='noopener noreferrer'>https://github.com/z4nta0/ease-my-life</a></span>{ /* What: Set About Creator Span Element. Why: The identity block also links to the project's own source code. How: This renders a fixed external link, opened in a new tab. */ }


							</div>


						</CarSurCom>



						<CarSurCom>{ /* What: Card Surface Component. Why: The "support the project" row needs the same bordered container as every other row in this tab. How: This wraps the support-project row below. */ }


							<div
								className='set-data-row set-support-project-row'

								data-element-name-hook='supProDiv'
							>{ /* What: Support Project Row Div Element. Why: The label/description and the disabled placeholder button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the disabled ButBasCom. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Support Project Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Support the project</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Support the project". */ }

									<span className='set-data-sub'>Enjoying Ease My Life? Consider buying me a coffee.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short, friendly ask. How: This renders the fixed description. */ }


								</div>



								<ButBasCom
									disabled
									kinValStr='secondary'
									sizValStr='sm'
								>Buy Me a Coffee</ButBasCom>{ /* What: Button Base Component. Why: A disabled placeholder communicates the feature exists without implying it works today. How: This renders with no onClick at all, since it is always disabled. */ }


							</div>


						</CarSurCom>



						<CarSurCom>{ /* What: Card Surface Component. Why: The "replay the welcome tour" row needs the same bordered container as every other row in this tab. How: This wraps the replay-tour row below. */ }


							<div
								className='set-data-row set-replay-tour-row'

								data-element-name-hook='repTouDiv'
							>{ /* What: Replay Tour Row Div Element. Why: The label/description and the Replay Tour button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Replay Tour ButBasCom. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Replay Tour Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Replay the welcome tour</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Replay the welcome tour". */ }

									<span className='set-data-sub'>Runs the first-run walkthrough again. Including the welcome message, a guided tour of pickers, generating your day, and reminders.</span>{ /* What: Set Data Sub Span Element. Why: The row needs to explain what pressing this button actually does. How: This renders the fixed description. */ }


								</div>



								<ButBasCom
									icoNamStr='refEle'
									kinValStr='secondary'
									sizValStr='sm'

									onClick={ () => { // What: Replay Tour Click Handler. Why: Replaying the tour needs to start from the Today tab with the onboarding flags reset. How: This navigates home, then resets (and, for an established account, self-heals) the onboarding flags.


										if ( onNavHomFun ) onNavHomFun(); // What: Navigate Home Call. Why: The Welcome Tour's own anchors only exist on the Today tab. How: This calls onNavHomFun, if provided, before touching any onboarding flags below.



										const hasReaBoo = staAppObj.pickers.some( ( picCurObj ) => !ONB_SPI_ARR.includes( picCurObj.id ) ); // What: Has Real Boolean. Why: Only a real, established account (one holding at least 1 non-sample picker) needs this self-healing correction applied. How: This is true whenever any of staAppObj.pickers is not one of the seeded sample picker ids. // Self-healing for accounts whose checklistDone got permanently stuck false by a since-fixed migStaFun() gap (real, established accounts that updated through an old version boundary before that field existed; see migStaFun()'s own comment on this in migrate.js). That stale false silently reactivates first-time checklist mode on replay instead of replay-continuation mode, defeating name-collision suppression, hiding App Features, and leaving the closing Generate card stuck permanently visible. Any account that already has a real (non-sample) picker is unambiguously past onboarding regardless of what checklistDone happens to say, so correct it here, the one place we can be sure right before a replay actually starts. // appFeaturesIntroSeen gets the same treatment for the same reason: it's the one-time "One Last Thing..." tip that's meant to ambush a user the FIRST moment App Features ever appears for them, right after finishing a real checklist. An established account replaying the tour has obviously already passed that moment, so leaving it at whatever stale false an old export happens to carry made the checklistDone fix above immediately re-trigger that one-time intro (scroll + highlight) on every single replay instead.


										actStoObj.setOnbFun({ // What: Set Onboarding Call. Why: This is the actual reset of the tour's own onboarding flags, always clearing the core 5 and conditionally correcting the 2 self-healing ones. How: This spreads in appFeaturesIntroSeen/checklistDone only while hasReaBoo is true.


											appFeatures                : {},    // What: App Features. Why: Replaying should show every App Features card as unseen again. How: This resets the per-feature seen map to empty.
											appFeaturesSectionResolved : false, // What: App Features Section Resolved. Why: The App Features section should reappear on replay. How: This clears its resolved flag.
											checklist                  : {},    // What: Checklist. Why: The replay walks the checklist from the start. How: This resets the per-step checklist map to empty.
											dismissed                  : true,  // What: Dismissed. Why: A replay must not regenerate the list or unhide the original sample data, since the user's own real data is already in place. How: This marks the account as a replay rather than a true first run.
											welcomed                   : false, // What: Welcomed. Why: The welcome modal should show again on replay. How: This clears the welcomed flag, which reopens the modal on the already-mounted app.

											...( hasReaBoo ? { appFeaturesIntroSeen : true, checklistDone : true } : {} ) // What: Self-Healing Flags Spread. Why: An established account must not fall back into first-time checklist mode or re-trigger the one-time App Features intro. How: This forces both flags true only while hasReaBoo is true, adding nothing otherwise.


										});


									} }
								>Replay Tour</ButBasCom>{ /* What: Button Base Component. Why: This is the actual trigger that restarts the first-run walkthrough. How: This navigates home, then resets (and, for an established account, self-heals) the onboarding flags when clicked. */ }


							</div>


						</CarSurCom>



						<ConSupCom />{ /* What: Contact Support Component. Why: The support form is substantial enough to live in its own component. How: This renders it with no props, since it keeps all of its own state locally. */ }


					</section>


					<section
						ref={ ( secCurEle ) => { secMapRef.current[ 'legal' ] = secCurEle; } }

						className='set-section set-section--legal'

						style={{ minHeight : legMinNum }}

						data-element-name-hook='setLegSec'
					>{ /* What: Legal Section Element. Why: This is the Legal section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the Privacy Policy/Terms of Service rows. Its data-element-name-hook is read by the Settings page tour. */ }


						<div className='set-section-h'>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This wraps the section's own kicker span below. */ }


							<span className='kicker'>Legal</span>{ /* What: Kicker Span Element. Why: The section's own name uses the shared small kicker style. How: This renders the fixed text "Legal". */ }


						</div>

						<p className='settings-sub'>The documents below outline what you&rsquo;re agreeing to by using Ease My Life.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Legal. */ }



						<CarSurCom>{ /* What: Card Surface Component. Why: Both document rows share one bordered container. How: This wraps the Privacy Policy row and the Terms of Service row. */ }


							<div
								className='set-data-row set-privacy-row'

								data-element-name-hook='priRowDiv'
							>{ /* What: Privacy Row Div Element. Why: The label/description and the View button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the View button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Privacy Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Privacy Policy</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Privacy Policy". */ }

									<span className='set-data-sub'>How your data is collected, used, and stored.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short description of what the document actually covers. How: This renders the fixed description. */ }


								</div>

								<button
									className='btn btn--secondary btn--sm'

									type='button'

									onClick={ () => setLegDocStr( 'privacy' ) }
								>View</button>{ /* What: Privacy View Button Element. Why: This is the actual trigger that opens the Privacy Policy inside LegModCom. How: This sets legDocStr to 'privacy' when clicked. */ }


							</div>


							<div
								className='set-data-row set-terms-row'

								data-element-name-hook='terRowDiv'
							>{ /* What: Terms Row Div Element. Why: The label/description and the View button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the View button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


								<div className='set-data-info'>{ /* What: Terms Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Terms of Service</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Terms of Service". */ }

									<span className='set-data-sub'>The rules for using Ease My Life, including paid features.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short description of what the document actually covers. How: This renders the fixed description. */ }


								</div>

								<button
									className='btn btn--secondary btn--sm'

									type='button'

									onClick={ () => setLegDocStr( 'terms' ) }
								>View</button>{ /* What: Terms View Button Element. Why: This is the actual trigger that opens the Terms of Service inside LegModCom. How: This sets legDocStr to 'terms' when clicked. */ }


							</div>


						</CarSurCom>


					</section>


				</div>


			</div>



			<LegModCom
				legDocStr={ legDocStr }

				onCloModFun={ () => setLegDocStr( null ) }
			/>{ /* What: Legal Modal Component. Why: Both Legal rows above need somewhere to actually show their own document text. How: This shows whichever document legDocStr names, or nothing while it is null, and clears it on close. */ }


		</div>


	);


}

// #endregion TabSetCom

// #endregion Components



// #region Exports

export { TabSetCom }; // What: Named Export. Why: app.jsx imports the Settings tab by this exact name. How: This exports TabSetCom; every other binding in this file is internal-only.

// #endregion Exports


