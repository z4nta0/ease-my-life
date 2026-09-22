


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useLayoutEffect, React.useCallback, React.useMemo) throughout, instead of importing individual named hooks.


import { annStaFun    } from './ui.jsx';                  // What: Announce Status Function. Why: Several actions here (export, import, reset) need to speak a transient status to screen readers once they finish. How: This is called after each of those actions completes, sometimes assertively so it is not dropped by a focus move.
import { APP_NAM_OBJ  } from './appearance.js';           // What: Appearance Namespace Object. Why: The Theme section needs to look up each built-in theme's own preview colors. How: This is read as APP_NAM_OBJ.PAL_SET_OBJ[key] when rendering each preset theme row.
import { ButBasCom    } from './ui.jsx';                  // What: Button Base Component. Why: Nearly every action in this tab (contact support, install, export/import/reset, replay tour, view legal docs) is triggered from this shared button component. How: This is rendered throughout the tab with varying kind/size/icon props.
import { CarSurCom    } from './ui.jsx';                  // What: Card Surface Component. Why: Every section's own controls sit inside this shared bordered container. How: This wraps the contents of nearly every set-subsection and set-section below.
import { CelPreCom    } from './settings-previews.jsx';   // What: Celebration Preview Component. Why: The completion-celebration style picker needs a live preview the user can play. How: This is rendered inside the Completion Celebration card, driven by celStyStr/celTokNum.
import { ColDisCom    } from './ui.jsx';                  // What: Collapse Disclosure Component. Why: The contact-support form and the pending import/reset confirmations all need to expand/collapse in place. How: This wraps the contact-support form's own CarSurCom, gated on its own open boolean.
import { HelButCom    } from './help-mode.jsx';           // What: Help Button Component. Why: This tab needs its own toggle for entering/exiting help mode, like every other tab. How: This is rendered in the header, toggling helModBoo.
import { HelOveCom    } from './help-mode.jsx';           // What: Help Overlay Component. Why: Help mode needs its own dimmed overlay plus tooltips layered above this tab's real content. How: This is rendered once, driven by helModBoo and SET_HEL_ARR.
import { HOL_NAM_OBJ  } from './holidays.js';             // What: Holidays Namespace Object. Why: The Holidays section needs both a default holidays-state shape and the computed U.S. holiday list for the current year. How: This is called via HOL_NAM_OBJ.defStaFun() and HOL_NAM_OBJ.comYeaFun() inside HolEdiCom.
import { IcoSvgCom    } from './ui.jsx';                  // What: Icon Svg Component. Why: A handful of controls (the custom-holiday delete button, the brand-mark logo) need a small glyph. How: This is rendered with a specific name/size prop wherever a glyph is needed.
import { InfTipCom    } from './ui.jsx';                  // What: Info Tip Component. Why: A disabled Export/Reset button still needs to explain why it is disabled. How: This wraps those buttons, given a label prop with the explanation.
import { LegModCom    } from './legal-docs.jsx';          // What: Legal Modal Component. Why: The Legal section's View buttons need somewhere to actually show the Privacy Policy/Terms of Service text. How: This is rendered once, driven by legDocStr, and closed by clearing that state back to null.
import { NOT_NAM_OBJ  } from './notify.js';               // What: Notification Namespace Object. Why: The Daily generator's notify-me row needs to read/request the browser's notification permission. How: This is called via its own permission()/askOnce()/request()/subscribe() methods, kept as this exact external name since it broke production once before under a rename.
import { ONB_SPI_ARR  } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Replaying the welcome tour needs to tell a real, established account apart from one still holding only seeded sample pickers. How: This is checked against state.pickers to decide whether to self-heal stale onboarding flags before the tour starts.
import { PicAniCom    } from './settings-previews.jsx';   // What: Picker Animation Component. Why: The picker-animation style picker needs a live preview the user can play. How: This is rendered inside the Picker Animation card, driven by picPreStr/picTokNum.
import { PWA_NAM_OBJ  } from './pwa.js';                  // What: Progressive Web App Namespace Object. Why: The Data Control section reports install/persistence state and drives the install prompt. How: This is called via its own subscribe()/isaStaFun()/canInsFun()/insStaFun()/askInsFun()/askPerFun() methods.
import { redMotFun    } from './ui.jsx';                  // What: Reduce Motion Function. Why: A jump-to-section scroll and both preview stages must not animate for a user who prefers reduced motion. How: This is checked before choosing 'smooth' vs 'auto' scroll behavior, and to track the note shown above each style picker.
import { SegConCom    } from './reminders.jsx';           // What: Segment Control Component. Why: The tab-bar-placement control is a 3-way exclusive choice, the exact shape this shared control renders. How: This renders the bottom/side/top options, driven by the persisted tabPlacement value.
import { SET_HEL_ARR  } from './help-content.jsx';        // What: Settings Help Array. Why: Help mode needs this tab's own catalog of tooltip targets. How: This is passed straight to HelOveCom.
import { STORAGE      } from './storage.js';              // What: Storage Namespace Object. Why: The Data Control section reports where data lives and reads the true persisted pick log before exporting. How: This is called via its own status()/readPersisted() methods.
import { useEscCanFun } from './ui.jsx';                  // What: Use Escape Cancel Function. Why: Both the pending-import and pending-reset confirmations need Escape to back out, like every other confirm in the app. How: This is called once per confirmation, gated on that confirmation's own open boolean.

// #endregion Imports



/**
 * tab-settings.jsx = Tab Settings
 *
 * @summary
 * The Settings tab: appearance/theme (TheSecCom's own built-in palette grid
 * via TheRowCom, plus a custom-color picker via TheCusCom), the Daily
 * Generator schedule, the holiday/days-off editor (HolEdiCom), account/data
 * import-export/wipe controls, and the contact-support form (ConSupCom).
 * StyRadCom is a small reusable styled-radio-group primitive (used for the
 * pick-animation-style preview rows); TabSettings itself ties every section
 * together as the tab.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



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


	const [ houNum, minNum ] = ( runTimStr || '04:00' ).split( ':' ).map( Number ); // What: Hour Number And Minute Number. Why: The raw "HH:MM" string must be split into numeric parts before it can be reformatted. How: This splits runTimStr (or the '04:00' default) on ':' and maps both halves through Number.
	const apmStr              = houNum < 12 ? 'AM' : 'PM';                          // What: Am Pm String. Why: A 12-hour label needs to say whether the hour is morning or afternoon/evening. How: This reads 'AM' for any hour before noon, 'PM' otherwise.
	const houDspNum           = houNum % 12 === 0 ? 12 : houNum % 12;               // What: Hour Display Number. Why: A 24-hour hour of 0 or 12 must read as "12" on a 12-hour clock, never "0". How: This takes the 24-hour hour modulo 12, substituting 12 whenever that remainder is 0.



	return `${ houDspNum }:${ String( minNum ).padStart( 2, '0' ) } ${ apmStr }`; // What: Formatted Label Return. Why: This is the function's whole purpose, a friendly "H:MM AM/PM" string. How: This joins houDspNum, the zero-padded minute, and apmStr with the literal punctuation a 12-hour clock label needs.


}

// #endregion forRunFun



// #region HolEdiCom

/**
 * HolEdiCom = Holiday Editor Component
 *
 * @summary
 * Renders the Holidays section's own editable list: every computed U.S.
 * holiday for the current year (each toggleable on/off via the
 * "Skip on holidays" gate every picker reads), plus any custom recurring
 * days off the user has added of their own, with a small form beneath
 * the list for adding another one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state   - State: The whole app state, read here for its own
 *                        state.holidays sub-object.
 * @param props.actions - Actions: The store's own action functions; this uses
 *                        addCustomHoliday/removeCustomHoliday/toggleHoliday.
 *
 * @returns The holiday list (computed rows plus custom rows) and the
 * "add a holiday" form beneath it, as a fragment.
 *
 * @example
 * ```tsx
 * HolEdiCom({ state, actions }) // => <HolEdiCom />
 * ```
 *
*/

function HolEdiCom ( { state, actions } ) {


	const curYeaNum = new Date().getFullYear();                                        // What: Current Year Number. Why: The computed U.S. holiday list is specific to a single calendar year. How: This reads the real device's current year and is passed to HOL_NAM_OBJ.comYeaFun below.
	const holStaObj = state.holidays || HOL_NAM_OBJ.defStaFun();                     // What: Holiday State Object. Why: A very old persisted state might not carry a holidays sub-object at all. How: This falls back to HOL_NAM_OBJ's own default shape when state.holidays is missing.
	const comHolArr = HOL_NAM_OBJ.comYeaFun( curYeaNum, holStaObj.country );       // What: Computed Holiday Array. Why: The list needs every rule-computed U.S. holiday for the current year and country. How: This calls HOL_NAM_OBJ.comYeaFun with the current year and the user's saved country.
	const disKeyArr = holStaObj.disabled || [];                                        // What: Disabled Key Array. Why: A toggled-off computed holiday must still render, just marked disabled. How: This is checked per-row below via .includes to decide each row's on/off state.
	const cusHolArr = holStaObj.custom || [];                                          // What: Custom Holiday Array. Why: The user's own added recurring days off need to render in their own list, below the computed ones. How: This is mapped below into its own set of rows.


	const [ draNamStr, setDraNamStr ] = React.useState( '' ); // What: Draft Name String And Setter. Why: The "add a holiday" form needs somewhere to hold the name being typed before it is actually added. How: This is bound to the name input below and read by addCusFun.
	const [ draDatStr, setDraDatStr ] = React.useState( '' ); // What: Draft Date String And Setter. Why: The "add a holiday" form needs somewhere to hold the date being picked before it is actually added. How: This is bound to the date input below and read by addCusFun.
	const [ exiIdeStr, setExiIdeStr ] = React.useState( null ); // What: Exiting Id String And Setter. Why: A removed custom holiday should play its fade-up-and-out exit before the row actually disappears. How: This holds the id currently mid-exit, checked per-row below to apply the 'is-exiting' class.


	const remExiFun = ( cusIdeStr ) => { // What: Remove With Exit Function. Why: Deleting a custom holiday should not simply vanish the row; it should play its own exit animation first. How: This flags cusIdeStr as exiting, then removes it from the store 300ms later, once that animation has had time to play.


		setExiIdeStr( cusIdeStr ); // What: Exiting Id Set. Why: This is what actually triggers the row's own exit class below. How: This writes the removed row's own id into exiIdeStr.

		setTimeout( () => { actions.removeCustomHoliday( cusIdeStr ); setExiIdeStr( null ); }, 300 ); // What: Delayed Removal Call. Why: The store must not drop the row until the fade-up-and-out animation has actually had time to play. How: This waits 300ms, then removes the holiday from the store and clears exiIdeStr.


	};


	const shtDatFun = ( datObj ) => datObj.toLocaleDateString( 'en-US', { weekday : 'short', month : 'short', day : 'numeric' } ); // What: Short Date Function. Why: Every computed holiday row needs a compact "Weekday, Month Day" label for when it lands. How: This formats datObj via toLocaleDateString with short weekday/month and numeric day.
	const realDayFun = ( datObj ) => datObj.toLocaleDateString( 'en-US', { weekday : 'long' } );                                     // What: Real Day Function. Why: An observed holiday (one shifted off a weekend) needs to also say which weekday it actually falls on. How: This formats datObj as just its own full weekday name.
	const recDatFun  = ( monValNum, dayValNum ) => new Date( 2001, monValNum - 1, dayValNum ).toLocaleDateString( 'en-US', { month : 'short', day : 'numeric' } ); // What: Recur Date Function. Why: A custom holiday recurs every year on the same month/day, so it needs a year-agnostic "Month Day" label instead of a real date. How: This builds a throwaway Date in a fixed dummy year purely to reuse toLocaleDateString's own formatting.


	const addCusFun = () => { // What: Add Custom Function. Why: The "add a holiday" form's own Add button needs to turn its 2 draft fields into a real custom holiday. How: This validates both drafts are filled, parses the date input's own month/day, adds the holiday, then clears both drafts.


		if ( !draNamStr.trim() || !draDatStr ) return; // What: Draft Validity Guard. Why: Both a name and a date are required before anything can be added. How: This bails out early whenever either draft is still empty/blank.


		const [ , monValNum, dayValNum ] = draDatStr.split( '-' ).map( Number ); // What: Month Value And Day Value. Why: A custom holiday recurs by month/day only, not by the specific year the date input happened to show. How: This splits the "YYYY-MM-DD" draft and discards the year, keeping only the numeric month and day.


		actions.addCustomHoliday( { name : draNamStr.trim(), month : monValNum, day : dayValNum } ); // What: Add Custom Holiday Call. Why: This is the actual store mutation that creates the new recurring day off. How: This calls actions.addCustomHoliday with the trimmed name and the parsed month/day.

		setDraNamStr( '' ); setDraDatStr( '' ); // What: Draft Reset Pair. Why: A successfully added holiday should leave the form empty and ready for the next one. How: This clears both draft fields back to their initial empty strings.


	};



	return (


		<>


			<ul className='holiday-list'>{ /* What: Holiday List Ul Element. Why: This is the whole editable list, computed holidays first, then any custom ones. How: This maps comHolArr and then cusHolArr into their own rows below. */ }


				{ comHolArr.map( ( holCurObj ) => { // What: Computed Holiday Map. Why: One row is needed per rule-computed holiday for the current year. How: This maps comHolArr, deriving each row's own on/off state from disKeyArr before rendering it.


					const holOnBoo = !disKeyArr.includes( holCurObj.keyStr ); // What: Holiday On Boolean. Why: A row's own switch and label both depend on whether this specific holiday is currently enabled. How: This is true unless the holiday's own key appears in disKeyArr.



					return (


						<li
							key={ holCurObj.keyStr }
							className={ ` holiday-row   ${ holOnBoo ? '' : 'is-off' } ` }
						>{ /* What: Holiday Row Li Element. Why: Each computed holiday needs its own row pairing its name/date info with an on/off switch. How: This renders holCurObj's own name and date, plus a switch bound to holOnBoo. */ }


							<div className='holiday-info'>{ /* What: Holiday Info Div Element. Why: The name and date need their own grouping, separate from the switch. How: This wraps the name span and the date span below. */ }


								<span className='holiday-name'>{ holCurObj.namStr }</span>{ /* What: Holiday Name Span Element. Why: Every row needs its own visible holiday name. How: This renders holCurObj's own name field. */ }

								<span className='holiday-date'>{ /* What: Holiday Date Span Element. Why: The landing date, and (when observed) the real weekday it falls on, need their own grouping. How: This wraps the main date span and, conditionally, the observed-note span below. */ }


									<span className='holiday-date-main'>{ shtDatFun( holCurObj.datObj ) }</span>{ /* What: Holiday Date Main Span Element. Why: Every row needs a compact landing-date label. How: This renders holCurObj's own date, formatted via shtDatFun. */ }

									{ holCurObj.obsBoo && ( // What: Observed Note Check. Why: A holiday shifted off a weekend needs to also explain which real weekday it falls on. How: This renders the observed-note span only while holCurObj.obsBoo is true.


										<span className='holiday-obs'>observed &middot; { holCurObj.namStr === "New Year's Day" ? 'falls' : 'lands' } on a { realDayFun( holCurObj.actObj ) }</span> // What: Holiday Obs Span Element. Why: This is the actual observed-weekday note text. How: This renders "falls"/"lands" (New Year's Day reads more naturally as "falls") followed by the real weekday from realDayFun.


									) }


								</span>


							</div>

							<button
								className={ ` switch   ${ holOnBoo ? 'is-on' : '' } ` }
								aria-pressed={ holOnBoo }
								aria-label={ `${ holOnBoo ? 'Disable' : 'Enable' } ${ holCurObj.namStr }` }
								onClick={ () => actions.toggleHoliday( holCurObj.keyStr ) }
							><i /></button>{ /* What: Holiday Switch Button Element. Why: Every computed holiday needs a way to toggle it off/on without deleting it outright. How: This calls actions.toggleHoliday with this row's own key when clicked. */ }


						</li>


					);


				} ) }

				{ cusHolArr.map( ( cusCurObj ) => ( // What: Custom Holiday Map. Why: One row is needed per user-added recurring day off. How: This maps cusHolArr into its own rows, each flagged exiting via exiIdeStr.


					<li
						key={ cusCurObj.id }
						className={ ` holiday-row   holiday-row--custom   holiday-row--enter   ${ exiIdeStr === cusCurObj.id ? 'is-exiting' : '' } ` }
					>{ /* What: Custom Holiday Row Li Element. Why: Each custom holiday needs its own row pairing its name/recurrence info with a delete button. How: This renders cusCurObj's own name and recurring date, plus a delete button bound to remExiFun. */ }


						<div className='holiday-info'>{ /* What: Holiday Info Div Element. Why: The name and recurrence need their own grouping, separate from the delete button. How: This wraps the name span and the date span below. */ }


							<span className='holiday-name'>{ cusCurObj.name }</span>{ /* What: Holiday Name Span Element. Why: Every row needs its own visible holiday name. How: This renders cusCurObj's own name field. */ }

							<span className='holiday-date holiday-date--custom'>{ /* What: Holiday Date Span Element. Why: A custom holiday's recurrence label needs its own grouping. How: This wraps the recurrence label and the "every year" note below. */ }


								<span>{ recDatFun( cusCurObj.month, cusCurObj.day ) }</span>{ /* What: Recur Label Span Element. Why: Every custom row needs a year-agnostic "Month Day" label. How: This renders cusCurObj's own month/day, formatted via recDatFun. */ }

								<span className='holiday-recur'>&middot; every year</span>{ /* What: Holiday Recur Span Element. Why: A custom holiday recurs annually, and that is not otherwise obvious from the date label alone. How: This renders a fixed "every year" note. */ }


							</span>


						</div>

						<button
							className='item-del'
							onClick={ () => remExiFun( cusCurObj.id ) }
							aria-label={ `Remove ${ cusCurObj.name }` }
						>{ /* What: Custom Holiday Delete Button Element. Why: A user-added holiday needs its own way to be removed entirely, unlike a computed one which can only be disabled. How: This calls remExiFun with this row's own id when clicked. */ }


							<IcoSvgCom
								name='trash'
								size={ 14 }
							/>{ /* What: Icon Svg Component. Why: The delete button needs a recognizable trash glyph. How: This renders the 'trash' icon at a fixed small size. */ }


						</button>


					</li>


				) ) }


			</ul>

			<div className='holiday-add'>{ /* What: Holiday Add Div Element. Why: Adding a custom holiday needs its own small form beneath the list. How: This wraps the name input, date input, and Add button. */ }


				<input
					className='np-input np-input--sm'
					type='text'
					value={ draNamStr }
					placeholder='Add a holiday, e.g. Birthday'
					autoComplete='off'
					aria-label='Name of the day off to add'
					onChange={ ( chaEveObj ) => setDraNamStr( chaEveObj.target.value ) }
					onKeyDown={ ( keyEveObj ) => {


						if ( keyEveObj.key === 'Enter' ) addCusFun(); // What: Enter Submit Branch. Why: Enter should submit the typed name the same way clicking Add would. How: This calls addCusFun.

						else if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); // What: Escape Blur Branch. Why: Escape should back out of the field without submitting, matching every other text input in this tab. How: This blurs the input via keyEveObj.currentTarget.


					} }
				/>{ /* What: Draft Name Input Element. Why: The user needs a text field to type a new holiday's own name into. How: This is bound to draNamStr, submits on Enter, and blurs on Escape like every other text input in this tab. */ }

				<input
					className='np-input np-input--sm holiday-date-input'
					type='date'
					value={ draDatStr }
					aria-label='Date'
					onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); } }
					onChange={ ( chaEveObj ) => setDraDatStr( chaEveObj.target.value ) }
				/>{ /* What: Draft Date Input Element. Why: The user needs a native date picker to choose the new holiday's own recurring month/day. How: This is bound to draDatStr and blurs on Escape like every other input in this tab. */ }

				<ButBasCom
					kind='primary'
					size='sm'
					icon='plus'
					disabled={ !draNamStr.trim() || !draDatStr }
					onClick={ addCusFun }
				>Add</ButBasCom>{ /* What: Button Base Component. Why: The form needs an explicit submit action, disabled until both drafts are filled. How: This calls addCusFun when clicked. */ }


			</div>


		</>


	);


}

// #endregion HolEdiCom



/**
 * APP_VER_STR = App Version String
 *
 * @summary
 * Injected from package.json's own "version" field at build time by
 * vite.config.js (see __APP_VERSION__), so `npm version` stays the
 * single source of truth and the About section can never drift from
 * the actual build. The ?? guard keeps this rendering a sane fallback
 * if the define is ever missing, such as running a file outside the
 * real Vite build.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const APP_VER_STR = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : null; // What: App Version String. Why: The About section and the support form's diagnostic field both need the real build version, never a hand-maintained copy. How: This reads the build-time __APP_VERSION__ define, falling back to null when it is missing.



// #region detBroFun

/**
 * detBroFun = Detect Browser Function
 *
 * @summary
 * A lightweight browser name + version sniff for the support form's
 * read-only diagnostic fields. Covers the common engines and falls
 * back to the raw user-agent string if nothing matches, rather than
 * guessing wrong.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A short "Name X.Y" label for a recognized browser, or the
 * raw navigator.userAgent string otherwise.
 *
 * @example
 * ```ts
 * detBroFun() // => 'Chrome 128.0'
 * ```
 *
*/

function detBroFun () {


	const useAgeStr = navigator.userAgent; // What: User Agent String. Why: Every pattern below is matched against the browser's own real user-agent string. How: This reads navigator.userAgent once, reused by every pattern check below.

	const braPatArr = [ // What: Browser Pattern Array. Why: This is the ordered list of engines this function can recognize, checked most-specific first (Edge/Opera before the Chrome substring they both also contain). How: This is iterated below, matching each entry's own regObj against useAgeStr.


		{ namStr : 'Edge',    regObj : /Edg\/([\d.]+)/ },                // What: Name String. Why: This labels the recognized browser. How: This is used directly in the returned label. // What: Regex Object. Why: This is the pattern that recognizes this specific browser from the user-agent string. How: This is matched against useAgeStr, capturing the version number.
		{ namStr : 'Opera',   regObj : /OPR\/([\d.]+)/ },                // What: Name String. Why: This labels the recognized browser. How: This is used directly in the returned label. // What: Regex Object. Why: This is the pattern that recognizes this specific browser from the user-agent string. How: This is matched against useAgeStr, capturing the version number.
		{ namStr : 'Chrome',  regObj : /Chrome\/([\d.]+)/ },             // What: Name String. Why: This labels the recognized browser. How: This is used directly in the returned label. // What: Regex Object. Why: This is the pattern that recognizes this specific browser from the user-agent string. How: This is matched against useAgeStr, capturing the version number.
		{ namStr : 'Firefox', regObj : /Firefox\/([\d.]+)/ },            // What: Name String. Why: This labels the recognized browser. How: This is used directly in the returned label. // What: Regex Object. Why: This is the pattern that recognizes this specific browser from the user-agent string. How: This is matched against useAgeStr, capturing the version number.
		{ namStr : 'Safari',  regObj : /Version\/([\d.]+).*Safari/ }     // What: Name String. Why: This labels the recognized browser. How: This is used directly in the returned label. // What: Regex Object. Why: This is the pattern that recognizes this specific browser from the user-agent string. How: This is matched against useAgeStr, capturing the version number.


	];


	for ( const { namStr, regObj } of braPatArr ) { // What: Pattern Match Loop. Why: The first pattern that actually matches the real user-agent string wins. How: This iterates braPatArr in order, returning as soon as one pattern matches.


		const matArr = useAgeStr.match( regObj ); // What: Match Array. Why: This is the actual test of whether this pattern recognizes the current browser. How: This runs regObj against useAgeStr, producing null or a match array with the captured version in [1].

		if ( matArr ) return `${ namStr } ${ matArr[ 1 ].split( '.' ).slice( 0, 2 ).join( '.' ) }`; // What: Recognized Browser Return. Why: A recognized browser should report its own name and a short major.minor version, not the full patch string. How: This returns "Name X.Y", trimming the captured version down to its first 2 dot-separated parts.


	}



	return useAgeStr; // What: Unrecognized Fallback Return. Why: An unrecognized browser is still worth reporting for diagnostics, even without a friendly name. How: This returns the raw user-agent string as-is.


}

// #endregion detBroFun



const SET_SEC_ARR = [ // What: Settings Section Array. Why: This drives both the left nav (in this exact order) and the right pane's own sections; keeping the 2 in lockstep means mapping over this one array for both. How: This is mapped over both in the rail's own nav links and, implicitly, by each section's own ref registration below.


	{ ideStr : 'appearance', labStr : 'Appearance' },       // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'daily',     labStr : 'Daily generator' },   // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'holidays',  labStr : 'Holidays' },          // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'data',      labStr : 'Data control' },      // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'account',   labStr : 'Account' },           // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'about',     labStr : 'About' },             // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.
	{ ideStr : 'legal',     labStr : 'Legal' }              // What: Identifier String. Why: This uniquely identifies the section for scroll-spy/jump-to and ref lookup. How: This is compared against actSecStr and used as the sectionRefs key. // What: Label String. Why: This names the section for the user. How: This is rendered as the rail link's own visible text.


];



const SUPPORT_EMAIL = 'support@easemylife.app'; // What: Support Email. Why: This is the fallback address shown when the in-app form fails to send. How: This is rendered in the failure message and copied by copAdrFun.



const SUPPORT_FORM_NAME = 'support'; // What: Support Form Name. Why: Netlify matches an incoming POST to its own detected form by this exact "form-name" value. How: This is posted as the 'form-name' field and must match index.html's own static <form name="support">.



// #region ConSupCom

/**
 * ConSupCom = Contact Support Component
 *
 * @summary
 * A collapsible card (the same disclosure pattern used elsewhere in the
 * app) holding a small support form: subject, message, and 2 read-only
 * diagnostic fields (app version + browser) so bug reports arrive with
 * useful context already attached.
 *
 * Send POSTs to Netlify Forms. 2 things this depends on OUTSIDE this
 * file: (1) the static `<form name="support" netlify hidden>` in
 * index.html, since Netlify detects forms by parsing the built HTML at
 * deploy time and never runs the app itself, so a React-rendered form
 * alone is invisible to it (the field names there MUST match the keys
 * posted below); (2) Netlify's Forms feature being enabled for the site,
 * with a notification email configured, so submissions actually reach an
 * inbox rather than only the Netlify dashboard.
 *
 * If the POST fails for any reason (offline, Forms not enabled, a deploy
 * that dropped the static form), the user is shown the address instead
 * and their own typed text is preserved.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state   - State: The whole app state; unused directly by this
 *                        component today, but threaded through for consistency
 *                        with every other section here.
 * @param props.actions - Actions: The store's own action functions; unused
 *                        directly by this component today, same reason.
 *
 * @returns The "Having problems?" trigger card, plus the collapsible
 * support form beneath it.
 *
 * @example
 * ```tsx
 * ConSupCom({ state, actions } ) // => <ConSupCom />
 * ```
 *
*/

function ConSupCom ( { state, actions } ) {


	const [ frmOpnBoo, setFrmOpnBoo ] = React.useState( false ); // What: Form Open Boolean And Setter. Why: The support form is not persisted; it always starts closed on load. How: This gates the ColDisCom below and is flipped by openForm/cancel.
	const [ draSubStr, setDraSubStr ] = React.useState( '' ); // What: Draft Subject String And Setter. Why: The subject field needs somewhere to hold its own typed value before sending. How: This is bound to the subject input below and read by sndFrmFun.
	const [ draMesStr, setDraMesStr ] = React.useState( '' ); // What: Draft Message String And Setter. Why: The message field needs somewhere to hold its own typed value before sending. How: This is bound to the message textarea below and read by sndFrmFun.
	const [ senAtNum, setSenAtNum ] = React.useState( 0 ); // What: Sent At Number And Setter. Why: A successful send needs both a truthy flag and a fresh React key to replay the "sent" note if the user sends a second message later. How: This is set to Date.now() on a successful send and used as both the visibility check and the key below.
	const [ shoErrBoo, setShoErrBoo ] = React.useState( false ); // What: Show Error Boolean And Setter. Why: Pressing Send with an empty field needs to surface a validation message. How: This is set true by sndFrmFun's own guard and cleared on every subsequent send attempt.
	const [ sndFalBoo, setSndFalBoo ] = React.useState( false ); // What: Send Failed Boolean And Setter. Why: A failed POST needs to surface the fallback address instead of leaving the user stuck. How: This is set inside sndFrmFun's own catch handler.
	const [ adrCpdBoo, setAdrCpdBoo ] = React.useState( false ); // What: Address Copied Boolean And Setter. Why: The fallback "Copy address" button needs to confirm the copy actually happened. How: This is set true by copAdrFun and cleared 2400ms later.
	// Honeypot. Bots fill every field they find; humans never see this one, so a
	// non-empty value means we silently accept and drop the submission.
	const [ botFieStr, setBotFieStr ] = React.useState( '' ); // What: Bot Field String And Setter. Why: A spam bot filling this hidden field is the signal a real human never would. How: This is posted alongside the real fields and left for Netlify's own spam filtering to act on.
	const braNamStr    = React.useMemo( () => detBroFun(), [] );        // What: Browser Name String. Why: The diagnostic fields need the detected browser, computed once rather than on every render. How: This memoizes detBroFun's own return value with an empty dependency array.
	const appVerStr    = APP_VER_STR == null ? '1.0' : APP_VER_STR;     // What: App Version String. Why: The diagnostic fields still need a sane version to show even on a build where the define is missing. How: This falls back to '1.0' when APP_VER_STR is null.
	const frmCarRef    = React.useRef( null );                          // What: Form Card Reference. Why: openFrmFun needs a handle on the rendered form to scroll it into view. How: This is attached to the support-form div's own ref prop below.
	const canSndBoo    = draSubStr.trim() && draMesStr.trim();          // What: Can Send Boolean. Why: The Send button's own enabled state, and the validation guard, both depend on both drafts actually holding text. How: This is true only while both draSubStr and draMesStr trim to something non-empty.
	const [ isaSndBoo, setIsaSndBoo ] = React.useState( false ); // What: Is-A Sending Boolean And Setter. Why: A second Send press must not fire a second overlapping request while one is already in flight. How: This gates sndFrmFun's own guard and disables the Send button while true.


	const opnFrmFun = () => { // What: Open Form Function. Why: "Contact Support" needs to actually expand the form and bring it into view. How: This opens the form, then (after ColDisCom's own expand animation finishes) scrolls it into view if it would otherwise sit below the fold.


		setFrmOpnBoo( true ); // What: Form Open Call. Why: This is the actual trigger that expands the ColDisCom below. How: This flips frmOpnBoo to true.

		setTimeout( () => { // What: Scroll-Into-View Timeout. Why: Scrolling must wait until ColDisCom's own expand animation has actually finished, so the form's final height (not a mid-animation one) is what gets measured. How: This waits 360ms, matching ColDisCom's own animation duration, before measuring and possibly scrolling.


			const frmCurEle = frmCarRef.current; // What: Form Current Element. Why: This gives a stable local handle on the rendered form for this measurement pass. How: This is read once from frmCarRef.current.
			const scrConEle = frmCurEle && frmCurEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scroll container is what actually needs to be scrolled, not the form itself. How: This walks up from frmCurEle to the nearest ancestor matching '.main'.

			if ( !frmCurEle || !scrConEle ) return; // What: Missing Element Guard. Why: Nothing can be measured or scrolled if either element is not actually mounted. How: This bails out early whenever either lookup above failed.



			const frmRecObj = frmCurEle.getBoundingClientRect(); // What: Form Rect Object. Why: Deciding whether the form overflows below the fold requires its own real, current position and size. How: This is compared against conRecObj below.
			const conRecObj = scrConEle.getBoundingClientRect(); // What: Container Rect Object. Why: The visible scroll boundary is relative to the container, not the viewport. How: This is combined with frmRecObj and the bottom tab bar's own rect below.

			// The floating bottom tab bar overlays .main rather than sitting
			// outside it, so its own top edge, not the container's raw bottom,
			// is the real visible boundary content can scroll up to. Other tab
			// placements (side/top) don't occupy this edge, so .tabbar--bottom
			// simply won't exist and conRecObj.bottom is used as-is.
			const barCurEle = document.querySelector( '.tabbar--bottom' ); // What: Bar Current Element. Why: A bottom-placed tab bar's own top edge is the real scroll boundary, when one exists. How: This queries for it directly; other placements leave this null.
			const visBotNum = barCurEle ? Math.min( conRecObj.bottom, barCurEle.getBoundingClientRect().top ) : conRecObj.bottom; // What: Visible Bottom Number. Why: This is the actual usable bottom edge content can scroll up to. How: This takes whichever is smaller, the container's own bottom or the bottom bar's own top, falling back to the container's bottom when there is no bottom bar.

			// Bring the form's bottom into view (with a little breathing room),
			// but never scroll past its top, so the "Having problems?" row stays
			// visible too when the form is short enough to fit alongside it.
			const oveBelNum = frmRecObj.bottom - visBotNum + 24; // What: Overflow Below Number. Why: Only a form that actually overflows past the visible bottom edge needs any scrolling at all. How: This is the form's own bottom minus the visible bottom edge, plus 24px of breathing room.

			if ( oveBelNum > 0 ) scrConEle.scrollTo( { top : scrConEle.scrollTop + oveBelNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Scroll Into View Call. Why: The form should only actually be scrolled when it truly overflows below the fold. How: This scrolls the container down by exactly the overflow amount, animated unless reduced motion is preferred.


		}, 360 );


	};


	const cnlFrmFun = () => { // What: Cancel Form Function. Why: Cancelling the form should discard the draft and fully reset its own transient state. How: This clears both drafts and every transient flag, then closes the form.


		setDraSubStr( '' ); setDraMesStr( '' ); setShoErrBoo( false ); // What: Draft And Error Reset. Why: A cancelled form must not leave stale text or a stale validation message behind for next time. How: This clears both drafts and the validation-error flag.

		setSndFalBoo( false ); setAdrCpdBoo( false ); // What: Failure State Reset. Why: A cancelled form must not leave a stale failure/fallback state behind for next time. How: This clears both the send-failed and address-copied flags.

		setFrmOpnBoo( false ); // What: Form Close Call. Why: This is the actual trigger that collapses the form again. How: This flips frmOpnBoo back to false.


	};


	const copAdrFun = () => { // What: Copy Address Function. Why: The fallback row lets a user copy the support address with one click instead of selecting it by hand. How: This writes SUPPORT_EMAIL to the clipboard when available, confirming success for 2400ms.


		const copDonFun = () => { setAdrCpdBoo( true ); setTimeout( () => setAdrCpdBoo( false ), 2400 ); }; // What: Copy Done Function. Why: A successful copy needs to show a brief confirmation, then revert. How: This flips adrCpdBoo true, then false again 2400ms later.

		try {


			if ( navigator.clipboard && navigator.clipboard.writeText ) navigator.clipboard.writeText( SUPPORT_EMAIL ).then( copDonFun, () => {} ); // What: Clipboard Write Attempt. Why: The Clipboard API is not universally available, and a rejected promise here should not surface as an error. How: This writes SUPPORT_EMAIL to the clipboard when the API exists, silently ignoring a rejection.


		}

		catch ( e ) { /* the address is on screen either way */ }


	};


	// POST to Netlify Forms. Netlify listens for form-encoded POSTs on any path
	// of the site and matches them to a detected form by the `form-name` field,
	// hence posting to '/' rather than to an endpoint of our own.
	//
	// Only clear the form on success. A failed send must never eat what the
	// user typed, which is the whole reason this waits on the response instead
	// of optimistically confirming.
	const sndFrmFun = () => { // What: Send Form Function. Why: This is the actual submit action behind the Send button. How: This validates both drafts, POSTs to Netlify Forms, and only clears the drafts once that POST actually succeeds.


		if ( isaSndBoo ) return; // What: Already Sending Guard. Why: A second Send press while one request is already in flight must not fire a second, overlapping one. How: This bails out early whenever isaSndBoo is already true.

		if ( !canSndBoo ) { setShoErrBoo( true ); return; } // What: Draft Validity Guard. Why: Both fields are required before anything can be sent. How: This surfaces the validation message and bails out whenever canSndBoo is false.


		setShoErrBoo( false ); setSndFalBoo( false ); setIsaSndBoo( true ); // What: Send Attempt Reset. Why: A fresh send attempt must not carry over a stale error/failure state from a previous one. How: This clears both message flags and marks the request as now in flight.


		const reqBodStr = new URLSearchParams( { // What: Request Body String. Why: Netlify Forms expects a standard form-encoded POST body, matching the static form's own field names in index.html. How: This builds that body from the form-name, the honeypot, and the 4 real fields.


			'bot-field' : botFieStr,
			browser     : braNamStr,
			'form-name' : SUPPORT_FORM_NAME,
			message     : draMesStr.trim(),
			subject     : draSubStr.trim(),
			version     : appVerStr


		} ).toString();


		fetch( '/', {


			body    : reqBodStr,
			headers : { 'Content-Type' : 'application/x-www-form-urlencoded' },
			method  : 'POST'


		} ).then( ( fetResObj ) => { // What: Fetch Then Handler. Why: Netlify's own response status is the only reliable signal of whether the submission was actually accepted. How: This throws on a non-ok status (caught below), otherwise clears the drafts and shows the sent confirmation.


			if ( !fetResObj.ok ) throw new Error( 'HTTP ' + fetResObj.status ); // What: Non-Ok Status Guard. Why: Netlify can accept the connection but still reject the submission itself. How: This throws, routing to the catch handler below, whenever the response status is not ok.

			setDraSubStr( '' ); setDraMesStr( '' ); // What: Draft Clear On Success. Why: A successfully sent message should not linger in the form. How: This clears both drafts back to empty strings.

			setSenAtNum( Date.now() ); setFrmOpnBoo( false ); // What: Sent Confirmation Trigger. Why: The user needs to see confirmation, and the form itself no longer needs to stay open. How: This stamps senAtNum with the current time and closes the form.


		} ).catch( () => { // What: Fetch Catch Handler. Why: Offline, Forms not enabled, or the static form missing from the build all surface here. How: This flags the send as failed so the fallback address can be shown.


			setSndFalBoo( true ); // What: Send Failed Flag. Why: This is what actually surfaces the fallback address and copy button below. How: This flips sndFalBoo to true.


		} ).then( () => { // What: Fetch Finally Handler. Why: Whether the request succeeded or failed, it is no longer in flight. How: This clears isaSndBoo regardless of which branch above ran.


			setIsaSndBoo( false ); // What: Sending Flag Clear. Why: The Send button must re-enable once this attempt has actually finished. How: This flips isaSndBoo back to false.


		} );


	};



	return (


		<React.Fragment>


			<CarSurCom>{ /* What: Card Surface Component. Why: "Having problems?" needs its own bordered container, matching every other row in this tab. How: This wraps the trigger row below. */ }


				<div className='set-data-row set-contact-trigger'>{ /* What: Contact Trigger Div Element. Why: The label/description and the trigger button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Contact Support button. */ }


					<div className='set-data-info'>{ /* What: Contact Info Div Element. Why: The row's own name/description/sent-note need their own grouping, apart from the button. How: This wraps the name span, the description span, and (conditionally) the sent-confirmation span. */ }


						<span className='set-data-name'>Having problems?</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Having problems?". */ }

						<span className='set-data-sub'>Send a note and it&rsquo;ll come through with your app version and browser attached, so there&rsquo;s no back-and-forth to track those down.</span>{ /* What: Set Data Sub Span Element. Why: Every row in this tab explains itself with this same span. How: This renders the fixed description text. */ }

						{ senAtNum > 0 && ( // What: Sent Confirmation Check. Why: A confirmation note should only exist right after an actual successful send. How: This renders the confirmation span only while senAtNum holds a real timestamp.


							<span
								className='set-import-msg is-ok'
								role='status'
								key={ senAtNum }
							>Message sent &mdash; thanks! I&rsquo;ll be in touch.</span> // What: Sent Confirmation Span Element. Why: This is the actual confirmation text shown after a successful send. How: This is remounted (via its own senAtNum key) so a repeat send replays the announcement.


						) }


					</div>

					<ButBasCom
						kind='secondary'
						size='sm'
						onClick={ opnFrmFun }
					>Contact Support</ButBasCom>{ /* What: Button Base Component. Why: This is the actual trigger that expands the support form below. How: This calls opnFrmFun when clicked. */ }


				</div>


			</CarSurCom>

			<ColDisCom open={ frmOpnBoo }>{ /* What: Collapse Disclosure Component. Why: The support form itself should stay collapsed until the trigger above is pressed. How: This mounts/expands its own CarSurCom below, gated on frmOpnBoo. */ }


				<CarSurCom>{ /* What: Card Surface Component. Why: The form's own fields need the same bordered container as every other card in this tab. How: This wraps the whole support-form div below. */ }


					<div
						className='support-form'
						ref={ frmCarRef }
					>{ /* What: Support Form Div Element. Why: This is the form's own root, giving opnFrmFun a stable element to measure and scroll to. How: This wraps the subject/message fields, the diagnostic fields, the honeypot, and the form's own footer buttons. */ }


						<label className='support-field'>{ /* What: Subject Label Element. Why: The subject input needs its own labeled field wrapper, matching the message field below. How: This wraps the visible field label and the subject input itself. */ }


							<span className='support-flabel'>Subject</span>{ /* What: Support Flabel Span Element. Why: The subject input needs a visible label. How: This renders the fixed text "Subject". */ }

							<input
								className='np-input'
								type='text'
								value={ draSubStr }
								placeholder="What's going on?"
								onChange={ ( chaEveObj ) => setDraSubStr( chaEveObj.target.value ) }
							/>{ /* What: Draft Subject Input Element. Why: The user needs a text field to type the support message's own subject into. How: This is bound to draSubStr. */ }


						</label>

						<div className='support-field'>{ /* What: Message Field Div Element. Why: The message textarea needs its own explicit label element rather than an implicit wrapping label, since its id must differ from index.html's own static form (see the comment on that id below). How: This wraps the message label and the message textarea. */ }


							{ /* id is "support-message-input", not "support-message", since that id
							    is already taken by index.html's hidden static Netlify form (see its
							    own comment above the <form name="support">), and duplicate ids on
							    the page confused the browser's label matching (both labels
							    applied, announcing "Message Message"). */ }
							<label
								className='support-flabel'
								htmlFor='support-message-input'
							>Message</label>{ /* What: Message Label Element. Why: The message textarea needs a visible, properly-associated label. How: This points at the textarea below via its own distinct id. */ }

							<textarea
								id='support-message-input'
								className='np-input support-textarea'
								value={ draMesStr }
								rows={ 5 }
								placeholder='The more detail, the better.'
								onChange={ ( chaEveObj ) => setDraMesStr( chaEveObj.target.value ) }
							/>{ /* What: Draft Message Textarea Element. Why: The user needs a multi-line field to type the support message's own body into. How: This is bound to draMesStr. */ }


						</div>

						<div className='support-diag'>{ /* What: Support Diag Div Element. Why: The 2 read-only diagnostic fields need their own grouping, separate from the editable fields above. How: This wraps the app-version field and the browser field. */ }


							<div className='support-diag-field'>{ /* What: Version Diag Field Div Element. Why: The app version needs its own labeled diagnostic row. How: This wraps its own label span and value span. */ }


								<span className='support-flabel'>App version</span>{ /* What: Support Flabel Span Element. Why: The diagnostic value needs a visible label. How: This renders the fixed text "App version". */ }

								<span className='support-diag-val'>{ appVerStr }</span>{ /* What: Support Diag Val Span Element. Why: The actual diagnostic value needs to render. How: This renders appVerStr. */ }


							</div>

							<div className='support-diag-field'>{ /* What: Browser Diag Field Div Element. Why: The detected browser needs its own labeled diagnostic row. How: This wraps its own label span and value span. */ }


								<span className='support-flabel'>Browser</span>{ /* What: Support Flabel Span Element. Why: The diagnostic value needs a visible label. How: This renders the fixed text "Browser". */ }

								<span className='support-diag-val'>{ braNamStr }</span>{ /* What: Support Diag Val Span Element. Why: The actual diagnostic value needs to render. How: This renders braNamStr. */ }


							</div>


						</div>

						<p
							className='support-hp'
							aria-hidden='true'
						>{ /* What: Honeypot Paragraph Element. Why: A real human never sees or fills this field, so any bot that does gives itself away. How: This wraps a label and input a screen reader never announces, hidden from assistive tech entirely. */ }


							<label>Don&rsquo;t fill this out if you&rsquo;re human:{ /* What: Honeypot Label Element. Why: A hidden form field still technically needs a label. How: This wraps the honeypot input below inside its own label text. */ }


								<input
									tabIndex={ -1 }
									autoComplete='off'
									name='bot-field'
									value={ botFieStr }
									onChange={ ( chaEveObj ) => setBotFieStr( chaEveObj.target.value ) }
								/>{ /* What: Bot Field Input Element. Why: A non-empty value here is the actual honeypot signal. How: This is bound to botFieStr and posted alongside the real fields. */ }


							</label>


						</p>

						<div className='support-form-foot'>{ /* What: Support Form Foot Div Element. Why: The validation/failure messages and the form's own action buttons need their own grouping at the bottom. How: This wraps whichever messages currently apply plus the Cancel/Send buttons. */ }


							{ shoErrBoo && !canSndBoo && ( // What: Validation Message Check. Why: A validation message should only show while the form is actually invalid and the user has already tried to send. How: This renders the message only while both conditions hold.


								<span
									className='support-valid-msg'
									key='verr'
								>Please fill out both form fields.</span> // What: Validation Message Span Element. Why: This is the actual validation copy shown on an empty-field send attempt. How: This renders fixed text explaining what is missing.


							) }

							{ sndFalBoo && !shoErrBoo && ( // What: Failure Message Check. Why: The fallback address should only show after an actual failed send, and not alongside an unrelated validation message. How: This renders the fallback message only while both conditions hold.


								<span
									className='support-fallback'
									role='status'
									key='sfail'
								>{ /* What: Failure Message Span Element. Why: This is the actual fallback copy shown on a failed send. How: This explains the likely cause and surfaces the raw support address. */ }


									Couldn&rsquo;t send &mdash; you may be offline. Your message is still here, so try again, or write to <span className='support-fallback-addr'>{ SUPPORT_EMAIL }</span>.


								</span>


							) }

							{ sndFalBoo && !shoErrBoo && ( // What: Copy Address Button Check. Why: The copy-address shortcut should only show alongside the fallback message above. How: This renders the button only while both conditions hold, same as the message above.


								<ButBasCom
									kind='ghost'
									size='sm'
									onClick={ copAdrFun }
								>{ adrCpdBoo ? 'Copied' : 'Copy address' }</ButBasCom> // What: Button Base Component. Why: This lets the user copy the fallback address without selecting it by hand. How: This calls copAdrFun when clicked, and its own label reflects adrCpdBoo.


							) }

							<ButBasCom
								kind='ghost'
								size='sm'
								onClick={ cnlFrmFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The form needs an explicit way to back out without sending. How: This calls cnlFrmFun when clicked. */ }

							<ButBasCom
								kind='secondary'
								size='sm'
								disabled={ isaSndBoo }
								onClick={ sndFrmFun }
							>{ isaSndBoo ? 'Sending…' : 'Send' }</ButBasCom>{ /* What: Button Base Component. Why: This is the form's own actual submit action. How: This calls sndFrmFun when clicked, disabling itself and relabeling while isaSndBoo is true. */ }


						</div>


					</div>


				</CarSurCom>


			</ColDisCom>


		</React.Fragment>


	);


}

// #endregion ConSupCom



/**
 * appearance-themes.jsx-section = Appearance Theme Section
 *
 * @summary
 * One full-width strip per theme (Option A from the mockups): background/
 * accent colors span the row, the name sits bottom-left. Only one theme
 * is ever active; clicking a row in either the Light or Dark card makes
 * it the live theme immediately, since there is no separate "current
 * mode" to track.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const LIG_THE_ARR = [ 'ink', 'sage', 'sand' ]; // What: Light Theme Array. Why: This is the fixed set of built-in light-based theme keys the Light card renders one row per. How: This is mapped in TheSecCom's own Light card.



const DAR_THE_ARR = [ 'night', 'moss', 'ember' ]; // What: Dark Theme Array. Why: This is the fixed set of built-in dark-based theme keys the Dark card renders one row per. How: This is mapped in TheSecCom's own Dark card.



// #region TheRowCom

/**
 * TheRowCom = Theme Row Component
 *
 * @summary
 * Renders one preset theme's own preview strip: a background swatch, an
 * accent swatch, a warn-color sliver, and the theme's own name, plus a
 * checkmark while it is the active theme.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.theKeyStr - Theme Key String: The theme's own key, such as
 *                          'ink' or 'moss'.
 * @param props.thePalObj - Theme Palette Object: The resolved palette to
 *                          preview, read from
 *                          APP_NAM_OBJ.PAL_SET_OBJ[theKeyStr].
 * @param props.actThmBoo - Active Theme Boolean: Whether this specific theme
 *                          is the currently active one.
 * @param props.drkModBoo - Dark Mode Boolean: Whether this row belongs to the
 *                          Dark card, for its own styling hook.
 * @param props.onClkFun  - On Click Function: Activates this theme when the
 *                          row itself is clicked or activated via keyboard.
 *
 * @returns One theme-row div, acting as a radio option within its own
 * card's implicit radio group.
 *
 * @example
 * ```tsx
 * TheRowCom({ theKeyStr, thePalObj, actThmBoo, ... }) // => <TheRowCom />
 * ```
 *
*/

function TheRowCom ( { pKey : theKeyStr, palette : thePalObj, active : actThmBoo, dark : drkModBoo, onClick : onClkFun } ) {



	return (


		<div
			className={ ` theme-row   ${ actThmBoo ? 'is-on' : '' }   ${ drkModBoo ? 'is-dark' : '' } ` }
			role='radio'
			aria-checked={ actThmBoo }
			tabIndex={ 0 }
			onClick={ onClkFun }
			onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' || keyEveObj.key === ' ' ) { keyEveObj.preventDefault(); onClkFun(); } } }
		>{ /* What: Theme Row Div Element. Why: This is the whole clickable/keyboard-activatable preview strip for one theme. How: This renders 3 stacked color swatches, the theme's own name, and (while active) a checkmark. */ }


			<i style={{ background : thePalObj.surStr }} />{ /* What: Surface Swatch Element. Why: This previews the theme's own background color across the bulk of the row. How: This is a bare, flex-grown <i> colored via thePalObj's own surStr. */ }

			<i style={{ background : thePalObj.accStr, flex : '0 0 34%' }} />{ /* What: Accent Swatch Element. Why: This previews the theme's own accent color as a fixed-width sliver. How: This is a bare <i> colored via thePalObj's own accStr, at a fixed 34% width. */ }

			<i style={{ background : thePalObj.warStr, flex : '0 0 12%' }} />{ /* What: Warn Swatch Element. Why: This previews the theme's own warn color as a fixed-width sliver. How: This is a bare <i> colored via thePalObj's own warStr, at a fixed 12% width. */ }

			<span>{ thePalObj.namStr }</span>{ /* What: Theme Name Span Element. Why: Every row needs its own visible theme name. How: This renders thePalObj's own namStr. */ }

			{ actThmBoo && ( // What: Active Checkmark Check. Why: A checkmark should only exist on whichever single row is currently active. How: This renders the checkmark span only while actThmBoo is true.


				<span
					className='theme-row-check'
					aria-hidden='true'
				>&#10003;</span> // What: Theme Row Check Span Element. Why: This is the actual checkmark glyph confirming the active theme. How: This renders a fixed checkmark character, hidden from screen readers since aria-checked already conveys this.


			) }


		</div>


	);


}

// #endregion TheRowCom



// #region TheCusCom

/**
 * TheCusCom = Theme Custom Component
 *
 * @summary
 * The "Custom…" row, styled exactly like the preset rows (the same
 * height, border-radius, and bottom-left name label) except its 3
 * segments ARE live `<input type="color">` swatches (50% background /
 * 30% accent / 20% text) rather than a static preview. Changing any
 * swatch saves and activates immediately; clicking the name label
 * activates without opening a color picker.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.theModStr - Theme Mode String: Either 'light' or 'dark',
 *                          selecting which of the 2 custom themes this row
 *                          edits.
 * @param props.cusColObj - Custom Color Object: The user's own saved custom
 *                          colors for this mode, or null before any have been
 *                          set.
 * @param props.actThmBoo - Active Theme Boolean: Whether this specific custom
 *                          theme is the currently active one.
 * @param props.drkModBoo - Dark Mode Boolean: Whether this row belongs to the
 *                          Dark card, for its own styling hook; defaults to
 *                          false.
 * @param props.actions   - Actions: The store's own action functions; this
 *                          uses setCustomTheme/setAppearanceTheme/
 *                          setCustomThemeName.
 *
 * @returns One theme-row div holding 3 live color inputs, a name input,
 * and (while active) a checkmark.
 *
 * @example
 * ```tsx
 * TheCusCom({ theModStr, cusColObj, actThmBoo, ... }) // => <TheCusCom />
 * ```
 *
*/

function TheCusCom ( { mode : theModStr, colors : cusColObj, active : actThmBoo, dark : drkModBoo, actions } ) {


	const draColObj = cusColObj || ( drkModBoo // What: Draft Color Object. Why: A row with no saved custom colors yet still needs sane starting values for its own 3 live swatches. How: This falls back to a fixed dark or light starting palette when cusColObj is null.


		? { bg : '#1e2230', text : '#f2f3f6', accent : '#7da4ff' }
		: { bg : '#fcfbf9', text : '#242629', accent : '#3360a8' }


	);

	const setColFun = ( colKeyStr, colValStr ) => actions.setCustomTheme( theModStr, { ...draColObj, [ colKeyStr ] : colValStr } ); // What: Set Color Function. Why: Changing any one swatch must save the FULL custom color set back to the store, not just the one changed key. How: This spreads draColObj and overwrites just the one changed key before saving.



	return (


		<div className={ ` theme-row   theme-row--custom   ${ actThmBoo ? 'is-on' : '' }   ${ drkModBoo ? 'is-dark' : '' } ` }>{ /* What: Theme Row Div Element. Why: This is the whole custom-theme row, styled to match the preset rows above it. How: This renders 3 live color inputs, a name input, and (while active) a checkmark. */ }


			<input
				type='color'
				className='theme-custom-swatch'
				style={{ flex : '1' }}
				value={ draColObj.bg }
				title='Background'
				aria-label='Custom background color'
				onClick={ () => actions.setAppearanceTheme( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
				onChange={ ( chaEveObj ) => setColFun( 'bg', chaEveObj.target.value ) }
			/>{ /* What: Background Swatch Input Element. Why: This is the live control for the custom theme's own background color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				type='color'
				className='theme-custom-swatch'
				style={{ flex : '0 0 34%' }}
				value={ draColObj.accent }
				title='Accent'
				aria-label='Custom accent color'
				onClick={ () => actions.setAppearanceTheme( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
				onChange={ ( chaEveObj ) => setColFun( 'accent', chaEveObj.target.value ) }
			/>{ /* What: Accent Swatch Input Element. Why: This is the live control for the custom theme's own accent color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				type='color'
				className='theme-custom-swatch'
				style={{ flex : '0 0 12%' }}
				value={ draColObj.text }
				title='Text'
				aria-label='Custom text color'
				onClick={ () => actions.setAppearanceTheme( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
				onChange={ ( chaEveObj ) => setColFun( 'text', chaEveObj.target.value ) }
			/>{ /* What: Text Swatch Input Element. Why: This is the live control for the custom theme's own text color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				type='text'
				className='theme-custom-name'
				placeholder='Custom'
				value={ draColObj.name || '' }
				maxLength={ 18 }
				aria-label={ `Name for your custom ${ theModStr === 'dark' ? 'dark' : 'light' } theme` }
				onFocus={ () => actions.setAppearanceTheme( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
				onChange={ ( chaEveObj ) => actions.setCustomThemeName( theModStr, chaEveObj.target.value ) }
				onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
			/>{ /* What: Custom Name Input Element. Why: A custom theme can carry its own user-chosen display name instead of a fixed preset name. How: This activates this custom theme on focus and saves the typed name via actions.setCustomThemeName on change, without also re-toggling the theme on every keystroke click. */ }

			{ actThmBoo && ( // What: Active Checkmark Check. Why: A checkmark should only exist while this specific custom theme is the active one. How: This renders the checkmark span only while actThmBoo is true.


				<span
					className='theme-row-check'
					aria-hidden='true'
				>&#10003;</span> // What: Theme Row Check Span Element. Why: This is the actual checkmark glyph confirming the active theme. How: This renders a fixed checkmark character, hidden from screen readers since the row's own state already conveys this.


			) }


		</div>


	);


}

// #endregion TheCusCom



// #region TheSecCom

/**
 * TheSecCom = Theme Section Component
 *
 * @summary
 * Renders both theme cards, Light and Dark, each holding its own 3
 * preset rows (via TheRowCom) plus a trailing custom row (via
 * TheCusCom).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state   - State: The whole app state, read here for its own
 *                        state.appearance sub-object.
 * @param props.actions - Actions: The store's own action functions, threaded
 *                        straight through to every TheRowCom/TheCusCom below.
 *
 * @returns Both theme cards, Light then Dark, as a fragment.
 *
 * @example
 * ```tsx
 * TheSecCom({ state, actions } ) // => <TheSecCom />
 * ```
 *
*/

function TheSecCom ( { state, actions } ) {


	const appCurObj = state.appearance || { theme : 'ink', customLight : null, customDark : null }; // What: Appearance Current Object. Why: A very old/incomplete persisted state might not carry an appearance object at all. How: This falls back to a default ink/no-custom-themes object when state.appearance is missing.



	return (


		<React.Fragment>


			<div className='set-subsection set-subsection--theme-light'>{ /* What: Theme Light Subsection Div Element. Why: The Light card needs its own labeled subsection, matching every other Appearance subsection. How: This wraps the subsection heading, its explanatory copy, and the Light theme CarSurCom. */ }


				<div className='set-subsection-h'>Theme &middot; Light</div>{ /* What: Set Subsection H Div Element. Why: Every subsection in Appearance names itself with this same heading style. How: This renders the fixed heading "Theme · Light". */ }

				<p className='settings-sub'>{ /* What: Settings Sub Paragraph Element. Why: The Light theme picker needs explanatory copy above its own card, matching every other subsection. How: This renders fixed copy about picking or creating a light theme. */ }


					Pick a light based theme below or create your own. If you enable the system
					preference option, the corresponding dark theme (e.g. Ink &rarr; Night) will be applied
					when applicable.


				</p>

				<p className='settings-sub'>{ /* What: Settings Sub Paragraph Element. Why: The custom-theme behavior deserves its own explanatory paragraph, separate from the general picker copy above. How: This renders fixed copy about the auto-generated inverse dark theme. */ }


					If you create a custom light theme then the app will automatically create an
					inverse dark theme from those colors, which you are then free to edit afterwards.


				</p>

				<CarSurCom>{ /* What: Card Surface Component. Why: The 3 preset rows and the custom row need a shared bordered container, matching every other picker in this tab. How: This wraps LIG_THE_ARR's own mapped rows plus the trailing TheCusCom. */ }


					{ LIG_THE_ARR.map( ( theKeyStr ) => ( // What: Light Theme Map. Why: One preview row is needed per entry in LIG_THE_ARR. How: This maps LIG_THE_ARR into one TheRowCom per key, each looking up its own palette from APP_NAM_OBJ.PAL_SET_OBJ.


						<TheRowCom
							key={ theKeyStr }
							pKey={ theKeyStr }
							palette={ APP_NAM_OBJ.PAL_SET_OBJ[ theKeyStr ] }
							active={ appCurObj.theme === theKeyStr }
							onClick={ () => actions.setAppearanceTheme( theKeyStr ) }
						/> // What: Theme Row Component. Why: This previews and activates one built-in light theme. How: This is passed its own palette, whether it is the active theme, and the activation callback.


					) ) }

					<TheCusCom
						mode='light'
						colors={ appCurObj.customLight }
						active={ appCurObj.theme === 'customLight' }
						actions={ actions }
					/>{ /* What: Theme Custom Component. Why: The Light card's own custom-theme row sits after its 3 presets. How: This is passed the user's saved custom-light colors, if any, and whether that custom theme is currently active. */ }


				</CarSurCom>


			</div>

			<div className='set-subsection set-subsection--theme-dark'>{ /* What: Theme Dark Subsection Div Element. Why: The Dark card needs its own labeled subsection, matching the Light one above. How: This wraps the subsection heading, its explanatory copy, and the Dark theme CarSurCom. */ }


				<div className='set-subsection-h'>Theme &middot; Dark</div>{ /* What: Set Subsection H Div Element. Why: Every subsection in Appearance names itself with this same heading style. How: This renders the fixed heading "Theme · Dark". */ }

				<p className='settings-sub'>{ /* What: Settings Sub Paragraph Element. Why: The Dark theme picker needs explanatory copy above its own card, matching the Light one above. How: This renders fixed copy about picking or creating a dark theme. */ }


					Pick a dark based theme below or create your own. If you enable the system
					preference option, the corresponding light theme (e.g. Night &rarr; Ink) will be applied
					when applicable.


				</p>

				<p className='settings-sub'>{ /* What: Settings Sub Paragraph Element. Why: The custom-theme behavior deserves its own explanatory paragraph here too, separate from the general picker copy above. How: This renders fixed copy about the auto-generated inverse light theme. */ }


					If you create a custom dark theme then the app will automatically create an
					inverse light theme from those colors, which you are then free to edit afterwards.


				</p>

				<CarSurCom>{ /* What: Card Surface Component. Why: The 3 preset rows and the custom row need a shared bordered container, matching the Light card above. How: This wraps DAR_THE_ARR's own mapped rows plus the trailing TheCusCom. */ }


					{ DAR_THE_ARR.map( ( theKeyStr ) => ( // What: Dark Theme Map. Why: One preview row is needed per entry in DAR_THE_ARR. How: This maps DAR_THE_ARR into one TheRowCom per key, each looking up its own palette from APP_NAM_OBJ.PAL_SET_OBJ.


						<TheRowCom
							key={ theKeyStr }
							pKey={ theKeyStr }
							palette={ APP_NAM_OBJ.PAL_SET_OBJ[ theKeyStr ] }
							dark
							active={ appCurObj.theme === theKeyStr }
							onClick={ () => actions.setAppearanceTheme( theKeyStr ) }
						/> // What: Theme Row Component. Why: This previews and activates one built-in dark theme. How: This is passed its own palette, whether it is the active theme, and the activation callback.


					) ) }

					<TheCusCom
						mode='dark'
						colors={ appCurObj.customDark }
						active={ appCurObj.theme === 'customDark' }
						dark
						actions={ actions }
					/>{ /* What: Theme Custom Component. Why: The Dark card's own custom-theme row sits after its 3 presets. How: This is passed the user's saved custom-dark colors, if any, and whether that custom theme is currently active. */ }


				</CarSurCom>


			</div>


		</React.Fragment>


	);


}

// #endregion TheSecCom



// #region StyRadCom

/**
 * StyRadCom = Style Radio Component
 *
 * @summary
 * A named-style radio list (used for both the Picker animation and
 * Completion celebration pickers), reusing the exact same full-bleed
 * radio rows the Data tab's picker-mode selector uses (a dot, a name,
 * and a hint that expands only on the selected row), so Appearance's
 * style pickers look and behave consistently with the rest of the app
 * rather than introducing a new control pattern.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.groNamStr  - Group Name String: The native radio group's own
 *                           `name` attribute, keeping its rows mutually
 *                           exclusive.
 * @param props.groLabStr  - Group Label String: The group's own accessible
 *                           name, applied to a visually-hidden legend since
 *                           the section's real heading, just above and outside
 *                           this component, already shows the same text.
 * @param props.radOptArr  - Radio Option Array: The list of { value, label,
 *                           hint } options to render, one row each.
 * @param props.value      - Value: The currently-selected option's own value.
 * @param props.onChange   - On Change: Selects a new option; the exact
 *                           standard name, left as-is.
 * @param props.onPreStyFun - On Preview Style Function: Plays a live preview
 *                            of one option's own style; omit to hide every
 *                            row's own Preview button entirely.
 * @param props.preDisBoo  - Previous Disabled Boolean: Disables every row's
 *                           own Preview button at once, such as while a
 *                           preview is already mid-animation.
 *
 * @returns A fieldset wrapping one radio row per entry in radOptArr,
 * each with an optional Preview button.
 *
 * @example
 * ```tsx
 * StyRadCom({ groNamStr, groLabStr, radOptArr, value, onChange, ... }) // => <StyRadCom />
 * ```
 *
*/

function StyRadCom ( { groupName : groNamStr, groupLabel : groLabStr, options : radOptArr, value, onChange, onPreview : onPreStyFun, previewDisabled : preDisBoo } ) {



	return (


		// A dedicated wrapper fieldset (rather than making .rd-mode-radio itself
		// a fieldset) since that class is shared with the Data tab's picker-mode
		// list, which renders it as a plain div nested inside its own fieldset,
		// so this reset is scoped to just this usage. The legend is visually
		// hidden, since the section's own visible heading (just above, outside
		// this CarSurCom) already shows this same text, and a visible legend here
		// would just duplicate it right above the radio rows.
		<fieldset className='style-radio-fieldset'>{ /* What: Style Radio Fieldset Element. Why: A native radio group needs a real fieldset/legend pairing for assistive tech, even though the legend itself stays visually hidden. How: This wraps the visually-hidden legend and the radio rows below. */ }


			<legend className='visually-hidden'>{ groLabStr }</legend>{ /* What: Style Radio Legend Element. Why: The group still needs a real accessible name, even with no visible legend text. How: This renders groLabStr, hidden visually but still exposed to assistive tech. */ }

			<div className='rd-mode-radio'>{ /* What: Radio Mode Div Element. Why: The actual rows need their own shared layout wrapper, reused from the Data tab's own picker-mode selector. How: This maps radOptArr into one label/row per option. */ }


				{ radOptArr.map( ( optCurObj ) => { // What: Radio Option Map. Why: One full-bleed row is needed per entry in radOptArr. How: This maps radOptArr, deriving each row's own selected state before rendering it.


					const optOnBoo = optCurObj.value === value; // What: Option On Boolean. Why: A row's own selected style and its hint's expanded state both depend on whether this is the currently-chosen option. How: This is true only when this option's own value matches the selected value.



					return (


						<label
							key={ optCurObj.value }
							className={ ` rd-mode-opt   ${ optOnBoo ? 'is-on' : '' } ` }
						>{ /* What: Radio Mode Opt Label Element. Why: The native radio input, the dot, and the name/hint text all need to sit inside one clickable label. How: This wraps the hidden radio input, the visual dot, the name/hint block, and (optionally) a Preview button. */ }


							<input
								type='radio'
								name={ groNamStr }
								checked={ optOnBoo }
								onChange={ () => onChange( optCurObj.value ) }
							/>{ /* What: Radio Option Input Element. Why: This is the actual native control backing the row's own selected state. How: This is checked while optOnBoo is true and selects this option's value on change. */ }

							<span
								className='rd-mode-dot'
								aria-hidden='true'
							></span>{ /* What: Radio Mode Dot Span Element. Why: The visual selected/unselected indicator is a styled dot, not the native radio's own default appearance. How: This is purely decorative, styled via CSS off the parent label's own 'is-on' class. */ }

							<span className='rd-mode-text'>{ /* What: Radio Mode Text Span Element. Why: The option's own name and its expanding hint need their own grouping. How: This wraps the name span and the always-mounted hint collapse below. */ }


								<span className='rd-mode-name'>{ optCurObj.label }</span>{ /* What: Radio Mode Name Span Element. Why: Every row needs its own visible option name. How: This renders optCurObj's own label. */ }

								{ /* Always-mounted collapse (not <ColDisCom>, which unmounts the hint
								    on deselect, since a freshly-inserted node can't transition its
								    own grid-template-rows and the height would snap). Keeping it
								    mounted lets the 0fr<->1fr glide run every time. */ }
								<div className={ ` collapse   ${ optOnBoo ? 'is-open' : '' } ` }>{ /* What: Collapse Div Element. Why: The hint text needs to expand/collapse in place without ever unmounting, so its own height transition can actually animate. How: This toggles its own 'is-open' class based on optOnBoo, driving a CSS grid-template-rows transition. */ }


									<div className='collapse-inner'><span className='rd-mode-hint'>{ optCurObj.hint }</span></div>{ /* What: Collapse Inner Div Element. Why: The CSS grid-row transition needs an inner wrapper to measure/clip against. How: This renders optCurObj's own hint text inside the collapsing region. */ }


								</div>


							</span>

							{ onPreStyFun && ( // What: Preview Button Check. Why: Not every caller wants a Preview button on each row. How: This renders the button only while the caller actually passed an onPreStyFun handler.


								<button
									type='button'
									className='style-preview-btn'
									disabled={ preDisBoo }
									onClick={ ( clkEveObj ) => { clkEveObj.preventDefault(); onPreStyFun( optCurObj.value ); } }
								>Preview</button> // What: Style Preview Button Element. Why: This is the actual control that plays a live preview of this specific option's own style. How: This prevents the click from also toggling the radio itself, then calls onPreStyFun with this option's own value.


							) }


						</label>


					);


				} ) }


			</div>


		</fieldset>


	);


}

// #endregion StyRadCom



// #region TabSettings

/**
 * TabSettings = Tab Settings
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
 * @param props.state       - State: {@link useStore}
 * @param props.actions     - Actions: {@link useStore}
 * @param props.onHome      - On Home: Navigates back to the Today tab; renamed
 *                            onHomFun below.
 * @param props.onNavTab    - On Nav Tab: Navigates to an arbitrary tab by id;
 *                            renamed onNavTabFun below.
 *
 * @returns The tab's own header, the section rail, and every section's
 * content in the right-hand pane, plus the Legal modal.
 *
 * @example
 * ```tsx
 * TabSettings({ state, actions, onHome, onNavTab }) // => <TabSettings />
 * ```
 *
*/

function TabSettings ( { state, actions, onHome : onHomFun, onNavTab : onNavTabFun } ) {


	const appCurObj = state.appearance || { theme : 'ink', customLight : null, customDark : null, autoSystem : false }; // What: Appearance Current Object. Why: A very old/incomplete persisted state might not carry an appearance object at all. How: This falls back to a default ink/no-custom-themes/no-auto-system object when state.appearance is missing.


	// #region Scroll-Spy And Jump-To

	// Mirrors the Today tab's own group rail. The scroll container is the
	// shared <main className="main">; sections live in the right pane and the
	// sticky rail on the left tracks / drives position.
	const [ actSecStr, setActSecStr ] = React.useState( 'daily' ); // What: Active Section String And Setter. Why: Both the rail's own highlighted link and the scroll-spy effect below need one shared source of truth for which section reads as current. How: This is written by the scroll-spy effect during normal scrolling and by jmpSecFun when a rail link is clicked.
	const [ legDocStr, setLegDocStr ] = React.useState( null ); // What: Legal Document String And Setter. Why: The Legal section's own View buttons need somewhere to record which document ('privacy' | 'terms') to show, or null for neither. How: This gates and selects LegModCom's own content below.
	// Help mode (see help-mode.jsx); every section here is static UI chrome, no
	// data-dependent content, so unlike Pickers/Data/Stats no disposable sample
	// data needs seeding.
	const [ helModBoo, setHelModBoo ] = React.useState( false ); // What: Help Mode Boolean And Setter. Why: This whole tab needs one shared flag for whether help mode is currently active. How: This gates HelOveCom below and is toggled by the header's own HelButCom.
	const helExiFun = React.useCallback( () => setHelModBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable callback to call when the user exits help mode from inside the overlay itself. How: This clears helModBoo; memoized with an empty dependency array since it only ever closes over a stable setter.
	// Appearance preview stages: bumping a token replays; celStyStr/picPreStr
	// hold which style is currently showing (null = idle, selector visible).
	const [ celTokNum, setCelTokNum ] = React.useState( 0 ); // What: Celebration Token Number And Setter. Why: CelPreCom needs a bump-to-replay signal distinct from which style is selected. How: This is incremented by plyCelFun and passed straight through as CelPreCom's own repTokNum prop.
	const [ celStyStr, setCelStyStr ] = React.useState( 'confetti' ); // What: Celebration Style String And Setter. Why: The preview stage needs to know which specific style to actually play. How: This is set by plyCelFun and passed straight through as CelPreCom's own styKeyStr prop.
	const [ picTokNum, setPicTokNum ] = React.useState( 0 ); // What: Picker Token Number And Setter. Why: PicAniCom needs a bump-to-replay signal distinct from which style is selected. How: This is incremented by plyPicFun and passed straight through as PicAniCom's own repTokNum prop.
	const [ picPreStr, setPicPreStr ] = React.useState( null ); // What: Picker Preview String And Setter. Why: The picker-animation stage should keep showing whichever style was last previewed, not the selected style, once its own cycle finishes. How: This is set by plyPicFun and, while non-null, overrides the selected pickAnim value passed to PicAniCom.
	const picPreTmo = React.useRef( null ); // What: Picker Preview Timeout. Why: A rapid second Preview press should not leave 2 overlapping timers around from an earlier press. How: This holds whichever timeout id plyPicFun most recently scheduled, cleared on unmount below.
	const plyCelFun = ( newStyStr ) => { setCelStyStr( newStyStr ); setCelTokNum( ( tokCurNum ) => tokCurNum + 1 ); }; // What: Play Celebration Function. Why: Pressing Preview on a celebration style option needs to both select and immediately replay that style. How: This sets celStyStr to newStyStr, then bumps celTokNum to trigger CelPreCom's own replay effect.
	const plyPicFun = ( newStyStr ) => { // What: Play Pick Function. Why: Pressing Preview on a picker-animation style option needs to both select and immediately replay that style. How: This clears any pending revert timeout, then sets picPreStr and bumps picTokNum to trigger PicAniCom's own remount.


		clearTimeout( picPreTmo.current ); // What: Preview Timeout Clear. Why: A rapid second Preview press must not let an earlier press's own stale timeout fire later and revert this fresh preview. How: This cancels whichever timeout picPreTmo currently holds, if any.

		setPicPreStr( newStyStr ); setPicTokNum( ( tokCurNum ) => tokCurNum + 1 ); // What: Preview State And Replay Trigger. Why: This is the actual preview activation, selecting the style and bumping the token PicAniCom remounts on. How: This sets picPreStr to newStyStr and increments picTokNum.

		// The strip runs ~2s. Leave `picPreStr` holding the previewed style after
		// it ends (don't revert to the selected style) so the stage keeps the
		// previewed animation's final frame instead of snapping to another
		// style.
		clearTimeout( picPreTmo.current ); // What: Preview Timeout Clear. Why: This mirrors the guard above; no revert timeout is actually scheduled today, but clearing defensively costs nothing. How: This cancels whichever timeout picPreTmo currently holds, if any.


	};

	React.useEffect( () => () => clearTimeout( picPreTmo.current ), [] ); // What: Unmount Cleanup Effect. Why: A pending preview-revert timeout must not fire after this whole tab has unmounted. How: This returns a cleanup function that cancels picPreTmo's own timeout; an empty dependency array means it only runs on unmount.

	const secMapRef  = React.useRef( {} );   // What: Section Map Reference. Why: Every section below registers itself here via its own ref callback, giving the scroll-spy/jump-to logic a live lookup from section id to DOM element. How: This is written to by each section's own ref prop and read throughout this component.
	const railEleRef = React.useRef( null ); // What: Rail Element Reference. Why: stkOffFun and the rail-fade effect both need a handle on the rail's own outer element. How: This is attached to the aside's own ref prop below.
	// The mobile pill bar's own horizontal scroller, separate from railEleRef;
	// see the fade-edge effect's own comment below for why.
	const railScrRef = React.useRef( null ); // What: Rail Scroll Reference. Why: The rail-fade effect needs to read scroll position from the actual scrolling element, distinct from the sticky outer rail the fade classes are toggled on. How: This is attached to the rail's own inner scroll wrapper below.
	const rooEleRef  = React.useRef( null );  // What: Root Element Reference. Why: The scroll-spy effect needs a handle on this component's own root to find its nearest '.main' scroll ancestor. How: This is attached to the tab's own outer div below.
	// While set, scroll-spy leaves this section active and skips its own
	// computation, cleared only once the user scrolls back up above it. This is
	// what makes Account/About "click to highlight": once picked, ordinary
	// scroll-spy (which drives daily/holidays/data) can't silently override
	// them.
	const skpSpyRef = React.useRef( false ); // What: Skip Spy Reference. Why: A section just jumped to via the rail must not have scroll-spy immediately recompute over it mid-scroll. How: This is set true for the duration of jmpSecFun's own scroll animation and read as a guard at the top of the scroll-spy handler.
	const pinSecRef = React.useRef( null );  // What: Pinned Section Reference. Why: The trailing sections (currently just Legal) can't scroll their own top past the spy's base line, so scroll position alone can never confirm they are still being viewed. How: This holds whichever section id is currently pinned active, read and cleared by the scroll-spy handler.
	// Where a jumped-to section should land below the top of the scroll
	// viewport (the desktop rail sticks at 16px; on mobile the rail is a
	// sticky bar, so its own height is added too). Measured live so the 2 stay
	// in agreement.
	const stkOffFun = () => { // What: Sticky Offset Function. Why: Both the scroll-spy handler and jmpSecFun need the exact same "how far below the viewport top" figure, computed fresh each time layout may have changed. How: This measures the rail's own current orientation and height, returning the extra offset a mobile sticky bar needs on top of a fixed 16px margin.


		const railCurEle = railEleRef.current; // What: Rail Current Element. Why: This gives a stable local handle on the rail for this measurement pass. How: This is read once from railEleRef.current.
		// .settings-rail is display:block; only its own <ul> flips to row on
		// mobile, so orientation is read from the ul (the rail's own
		// flex-direction is always the 'row' default and would misreport as
		// horizontal on desktop).
		const ulTagEle  = railCurEle && railCurEle.querySelector( 'ul' );                       // What: Ul Tag Element. Why: The rail's own flex-direction is not a reliable signal; its child ul's is. How: This queries the rail's own <ul> child.
		const horDirBoo = ulTagEle && getComputedStyle( ulTagEle ).flexDirection === 'row';      // What: Horizontal Direction Boolean. Why: The extra offset is only needed while the rail actually renders as a horizontal mobile bar. How: This checks the ul's own computed flex-direction for 'row'.



		return ( horDirBoo ? railCurEle.offsetHeight + 8 : 0 ) + 16; // What: Sticky Offset Return. Why: This is the actual usable offset callers add to their own scroll-position math. How: This adds the rail's own measured height plus 8px only in the horizontal/mobile case, then always adds a flat 16px margin.


	};


	React.useEffect( () => { // What: Scroll Spy Effect. Why: The rail's own active link must track which section is actually in view as the user scrolls, without fighting a section the user just explicitly jumped to. How: This computes, on every scroll, which registered section's own top has crossed the spy's base line, honoring a pinned trailing section until the user scrolls back up past it.


		const secEntArr = SET_SEC_ARR.map( ( secConObj ) => [ secConObj.ideStr, secMapRef.current[ secConObj.ideStr ] ] ).filter( ( [ , secCurEle ] ) => secCurEle ); // What: Section Entry Array. Why: Only sections that have actually mounted and registered a ref can be measured. How: This maps SET_SEC_ARR to [id, element] pairs, then drops any pair whose element is still missing.

		if ( !secEntArr.length ) return; // What: No Sections Guard. Why: There is nothing to spy on before any section has mounted. How: This bails out of the whole effect early when secEntArr came back empty.

		const scrConEle = rooEleRef.current?.closest( '.main' ); // What: Scroll Container Element. Why: The shared '.main' scroller, not the window, is what actually needs to be measured/listened to in the normal case. How: This walks up from this component's own root to the nearest '.main' ancestor.
		// Account + About are the trailing sections; with nothing after them
		// there's no scroll room left to carry their header past the spy's
		// base line, so scroll position can never reliably distinguish
		// "looking at Account" from "looking at About" (or from the section
		// before them). Rather than fight that geometry, they're click-only:
		// scrolling never assigns them active, only clicking their nav link
		// does (see jmpSecFun).
		const spyIdeSet = new Set( [ 'daily', 'holidays', 'data', 'account', 'about' ] ); // What: Spy Id Set. Why: Only these sections should ever be assigned active purely from scroll position. How: This is checked inside the loop below, skipping any section whose id is not a member.


		const onScrFun = () => { // What: On Scroll Function. Why: This is the actual scroll-spy computation, re-run on every scroll event. How: This finds the last spy-eligible section whose own top has crossed the base line, honoring a pinned trailing section along the way.


			if ( skpSpyRef.current ) return; // What: Skip Spy Guard. Why: A section the user just explicitly jumped to must not be immediately overridden mid-animation by this same computation. How: This bails out early while skpSpyRef.current is true.

			const basLinNum = ( scrConEle ? scrConEle.getBoundingClientRect().top : 0 ) + stkOffFun() + 8; // What: Base Line Number. Why: A section only counts as "reached" once its own top has scrolled up past this line. How: This adds the sticky offset plus an 8px margin to the scroll container's own top (or 0 for the window case).
			// Are we at (or within a hair of) the bottom of the scroll range? The
			// last sections can't scroll to the top line, so scroll position
			// alone can't tell them apart; at the bottom, honor whatever section
			// was pinned/active.
			const endRchBoo = scrConEle // What: End Reached Boolean. Why: The pinned-section logic below needs to know whether the scroll range has actually bottomed out. How: This compares the container's own (or window's) current scroll position against its own scrollable height, allowing a 2px hair of slack.


				? scrConEle.scrollTop + scrConEle.clientHeight >= scrConEle.scrollHeight - 2
				: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;


			if ( pinSecRef.current ) {


				const pinCurEle = secMapRef.current[ pinSecRef.current ]; // What: Pinned Current Element. Why: Deciding whether to keep or release the pin requires the pinned section's own live element. How: This looks up pinSecRef's own id in secMapRef.
				// Bottom-cluster sections (account/about/legal) can't scroll their
				// own top up to `basLinNum`, since the page runs out of scroll
				// first, so that can't be used as the "still viewing it" test.
				// Instead the pin is kept while the section's own top sits above
				// the viewport's vertical midline, released only once the user
				// scrolls UP far enough to push it below the midline (back into
				// earlier sections). It is also always kept while bottomed out.
				const viwHeiNum = scrConEle ? scrConEle.clientHeight : window.innerHeight;                                      // What: View Height Number. Why: The vertical midline test needs the scroll viewport's own current height. How: This reads the container's own clientHeight, or the window's own innerHeight for the window-scroll case.
				const midLinNum = ( scrConEle ? scrConEle.getBoundingClientRect().top : 0 ) + viwHeiNum / 2;                    // What: Mid Line Number. Why: This is the actual release threshold for a pinned trailing section. How: This adds half the viewport height to the container's own (or window's) top.

				if ( pinCurEle && ( endRchBoo || pinCurEle.getBoundingClientRect().top <= midLinNum ) ) return; // What: Keep Pin Guard. Why: A pinned section should stay active while still effectively in view or while the scroll range is bottomed out. How: This bails out of the rest of the computation whenever either condition holds.

				// Scrolled back up above it, so release the pin and fall through
				// to the normal spy computation below.
				pinSecRef.current = null; // What: Pin Release. Why: The user has scrolled back into earlier sections, so the pin no longer applies. How: This clears pinSecRef back to null.


			}


			let besIdeStr = secEntArr[ 0 ][ 0 ]; // What: Best Id String. Why: Some section must always end up active, defaulting to the very first one. How: This starts at the first entry's own id and is overwritten below as later, already-reached sections are found.

			for ( const [ secIdeStr, secCurEle ] of secEntArr ) { // What: Section Scan Loop. Why: The last spy-eligible section whose own top has crossed the base line is the one that should read active. How: This iterates every registered section in order, keeping the latest one that qualifies.


				if ( !spyIdeSet.has( secIdeStr ) ) continue; // What: Spy Eligibility Guard. Why: Trailing click-only sections must never be assigned active by this scan. How: This skips any section id not present in spyIdeSet.

				if ( secCurEle.getBoundingClientRect().top <= basLinNum ) besIdeStr = secIdeStr; // What: Reached Section Update. Why: A later section whose own top has already crossed the base line should win over an earlier one. How: This overwrites besIdeStr whenever the current section's own top is at or above the base line.


			}

			setActSecStr( besIdeStr ); // What: Active Section Update Call. Why: This is what actually moves the rail's own highlighted link. How: This writes besIdeStr into actSecStr.


		};


		onScrFun(); // What: Initial Scroll Spy Call. Why: The rail should already reflect the right section on mount, without waiting for the first scroll event. How: This invokes onScrFun once, synchronously.

		( scrConEle || window ).addEventListener( 'scroll', onScrFun, { passive : true } ); // What: Scroll Container Listener. Why: Most of the time there is a real '.main' scroller to listen to directly. How: This subscribes onScrFun to the container's own scroll event, or the window's if no container was found.

		window.addEventListener( 'scroll', onScrFun, { passive : true } ); // What: Window Scroll Listener. Why: A secondary window-level listener catches any scroll path the container-level one might miss. How: This subscribes onScrFun to the window's own scroll event as well.



		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both the container-level and window-level scroll listeners.


			( scrConEle || window ).removeEventListener( 'scroll', onScrFun ); // What: Scroll Container Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same onScrFun reference from the same target.

			window.removeEventListener( 'scroll', onScrFun ); // What: Window Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same onScrFun reference from the window.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own listeners once, on mount. How: An empty array means it never re-subscribes; every value it reads (refs, SET_SEC_ARR) is stable across renders anyway.


	// Scroll-edge fades on the mobile rail (horizontal pill bar), the same
	// affordance as the Data/Stats filter rows. The fade itself
	// (.settings-rail::before/::after, styles2.css) lives on the STICKY outer
	// rail, not on the element that actually scrolls (railScrRef, the inner
	// wrapper around <ul>); an earlier version put overflow-x AND the fade
	// pseudo-elements on the same (outer) element, which meant the fade (a
	// position:absolute child of that scrolling element) scrolled away WITH
	// the pills instead of staying pinned to the visible edges (confirmed on
	// real devices, not a Chromium-sandbox-only quirk: reproduced in both
	// Firefox and Chrome emulation). Reading scroll state from the inner
	// wrapper but toggling the state classes on the outer (non-scrolling)
	// rail keeps the fade itself immobile while still tracking real scroll
	// position.
	React.useEffect( () => { // What: Rail Fade Effect. Why: The mobile pill bar's own start/end fade edges need to reflect real scroll position, toggled on the non-scrolling outer rail. How: This reads scroll position from the inner scroller but writes the resulting classes onto the outer rail, resubscribing on both scroll and resize.


		const scrCurEle  = railScrRef.current; // What: Scroll Current Element. Why: The scrolling inner wrapper is what actually needs measuring. How: This is read once from railScrRef.current.
		const railCurEle = railEleRef.current; // What: Rail Current Element. Why: The non-scrolling outer rail is what the resulting fade classes actually get written onto. How: This is read once from railEleRef.current.

		if ( !scrCurEle || !railCurEle ) return; // What: Missing Element Guard. Why: Nothing can be measured or toggled if either element is not actually mounted yet. How: This bails out early whenever either lookup above failed.

		const updFadFun = () => { // What: Update Fade Function. Why: This is the actual recomputation, re-run on scroll and on resize. How: This toggles 'at-start'/'at-end' on railCurEle based on scrCurEle's own current scroll position.


			const canScrBoo = scrCurEle.scrollWidth - scrCurEle.clientWidth > 1; // What: Can Scroll Boolean. Why: A bar that does not actually overflow should read as "at both edges" rather than showing either fade. How: This is true only when the scrollable width exceeds the visible width by more than a rounding hair.

			railCurEle.classList.toggle( 'at-start', !canScrBoo || scrCurEle.scrollLeft <= 1 );                                                    // What: At Start Toggle. Why: The leading fade should hide once the bar cannot scroll further left. How: This applies whenever the bar can't scroll at all, or its own scrollLeft is already at (or within 1px of) 0.
			railCurEle.classList.toggle( 'at-end', !canScrBoo || scrCurEle.scrollLeft + scrCurEle.clientWidth >= scrCurEle.scrollWidth - 1 );       // What: At End Toggle. Why: The trailing fade should hide once the bar cannot scroll further right. How: This applies whenever the bar can't scroll at all, or its own scroll position has reached (or is within 1px of) its own scrollWidth.


		};


		updFadFun(); // What: Initial Fade Call. Why: The fade edges should already be correct on mount, without waiting for the first scroll/resize event. How: This invokes updFadFun once, synchronously.

		scrCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Fade Scroll Listener. Why: The fade edges must update live as the bar itself is scrolled. How: This subscribes updFadFun to scrCurEle's own scroll event.

		const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The bar's own overflow can change from a layout/content change alone, not just a real scroll. How: This creates an observer that re-runs updFadFun whenever scrCurEle itself resizes.

		resObsObj.observe( scrCurEle ); // What: Resize Observer Start Call. Why: This is what actually begins watching scrCurEle for size changes. How: This starts the observer created just above.



		return () => { // What: Effect Cleanup Function. Why: Neither the scroll listener nor the observer may outlive this effect run. How: This removes the scroll listener and disconnects the resize observer.


			scrCurEle.removeEventListener( 'scroll', updFadFun ); // What: Fade Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this run. How: This removes the same updFadFun reference from scrCurEle.

			resObsObj.disconnect(); // What: Resize Observer Teardown. Why: The observer must not keep watching scrCurEle after this effect run ends. How: This disconnects resObsObj entirely.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own listener/observer once, on mount. How: An empty array means it never re-subscribes; both refs it reads are stable across renders.


	const jmpSecFun = ( secIdeStr ) => { // What: Jump Section Function. Why: Clicking a rail link should scroll straight to that section and mark it active immediately, rather than waiting on the scroll-spy to catch up. How: This marks the target active, pins it if it's the trailing Legal section, then scrolls the right container to the right offset.


		const secCurEle = secMapRef.current[ secIdeStr ]; // What: Section Current Element. Why: There is nothing to jump to if this section has not actually registered a ref. How: This looks up secIdeStr in secMapRef.

		if ( !secCurEle ) return; // What: Missing Section Guard. Why: A stale or unregistered section id must not crash the jump. How: This bails out early when secCurEle came back undefined.

		setActSecStr( secIdeStr ); // What: Active Section Update Call. Why: The rail should highlight the target section immediately, not wait for the scroll to finish. How: This writes secIdeStr into actSecStr.

		// Only Legal (the very last section) still can't scroll its own top to
		// the line, so it alone needs pinning to stay active; every other
		// section now has enough scroll room below it for the spy to track it
		// naturally.
		pinSecRef.current = secIdeStr === 'legal' ? secIdeStr : null; // What: Pin Assignment. Why: Only the trailing Legal section needs its active state protected from the scroll-spy's own base-line test. How: This pins secIdeStr only when it equals 'legal', clearing the pin otherwise.

		skpSpyRef.current = true; // What: Skip Spy Set. Why: The scroll-spy handler must not fight this deliberate jump while it is still animating. How: This flags skpSpyRef true, checked as a guard at the top of onScrFun above.

		const scrConEle = secCurEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared '.main' scroller, not the window, is what actually needs scrolling in the normal case. How: This walks up from secCurEle to its nearest '.main' ancestor.
		// The first section is the top of the tab; scroll all the way up so the
		// header comes back into view rather than stopping at the section.
		const toTopBoo = secIdeStr === SET_SEC_ARR[ 0 ].ideStr; // What: To Top Boolean. Why: Jumping to the very first section should reveal the tab's own header too, not just that section. How: This is true only when secIdeStr matches SET_SEC_ARR's own first entry.


		if ( scrConEle ) {


			const ofsDelNum = secCurEle.getBoundingClientRect().top - scrConEle.getBoundingClientRect().top; // What: Offset Delta Number. Why: The scroll target must be computed relative to the container's own current scroll position, not an absolute page position. How: This is the section's own top minus the container's own top.
			const topPosNum = toTopBoo ? 0 : scrConEle.scrollTop + ofsDelNum - stkOffFun();                   // What: Top Position Number. Why: This is the actual scrollTop value to animate to. How: This is 0 for the top-of-tab case, otherwise the container's own current scrollTop plus ofsDelNum, minus the sticky offset so the section lands below the rail/header.

			scrConEle.scrollTo( { top : topPosNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Container Scroll Call. Why: This is the actual scroll animation for the normal, in-'.main' case. How: This scrolls scrConEle to topPosNum, animated unless reduced motion is preferred.


		}

		else {


			const topPosNum = toTopBoo ? 0 : secCurEle.getBoundingClientRect().top + window.scrollY - stkOffFun(); // What: Top Position Number. Why: This is the actual scrollTo value for the fallback, window-level scroll case. How: This is 0 for the top-of-tab case, otherwise the section's own viewport top plus the current window scroll, minus the sticky offset.

			window.scrollTo( { top : topPosNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Window Scroll Call. Why: This is the actual scroll animation for the fallback case, when no '.main' ancestor was found. How: This scrolls the window to topPosNum, animated unless reduced motion is preferred.


		}

		setTimeout( () => { skpSpyRef.current = false; }, 620 ); // What: Skip Spy Release. Why: The scroll-spy handler should resume normal computation once the jump's own scroll animation has had time to finish. How: This clears skpSpyRef back to false 620ms later.


	};

	// #endregion Scroll-Spy And Jump-To



	// Both animation-choice sections are inert while the OS "reduce motion"
	// setting is on: the app skips the pick reveal and the completion
	// celebration entirely. The PREVIEWS still play on demand (pressing Play
	// is explicit consent), so without this note the choice would look active
	// when it isn't. Tracked live so the note appears/disappears if the OS
	// setting changes mid-session.
	const [ redMotBoo, setRedMotBoo ] = React.useState( () => !!( redMotFun && redMotFun() ) ); // What: Reduce Motion Boolean And Setter. Why: Both style-picker sections need to know live whether the OS currently prefers reduced motion. How: This starts from an immediate redMotFun() check, then is kept in sync by the effect below.

	React.useEffect( () => { // What: Reduce Motion Listener Effect. Why: redMotBoo needs to update live if the OS setting changes while the app is open, not just reflect its value at mount. How: This subscribes a change listener to the prefers-reduced-motion media query and cleans it up on unmount.


		if ( !window.matchMedia ) return; // What: No MatchMedia Guard. Why: Some environments may not support matchMedia at all. How: This bails out of the effect entirely when matchMedia isn't available, leaving redMotBoo at its initial value.

		const medQueObj  = window.matchMedia( '(prefers-reduced-motion: reduce)' ); // What: Media Query Object. Why: The same query used for the initial value must be reused here so the listener matches. How: This is the live MediaQueryList the change listener below attaches to.
		const onMotChaFun = () => setRedMotBoo( medQueObj.matches );                // What: On Motion Change Function. Why: The OS's own reduced-motion setting can change at any time while the app is open. How: This updates redMotBoo to the media query's current match state whenever it fires a change event.

		medQueObj.addEventListener ? medQueObj.addEventListener( 'change', onMotChaFun ) : medQueObj.addListener( onMotChaFun ); // What: Change Subscribe Call. Why: Older browsers only support the deprecated addListener form. How: This registers onMotChaFun via whichever subscription method medQueObj actually supports.



		return () => { medQueObj.removeEventListener ? medQueObj.removeEventListener( 'change', onMotChaFun ) : medQueObj.removeListener( onMotChaFun ); }; // What: Effect Cleanup Return. Why: The change listener must not outlive this effect run. How: This removes the same onMotChaFun reference, via whichever method it was originally added with.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.

	const motNotFun = ( namTexStr ) => redMotBoo ? ( // What: Motion Note Function. Why: Both style-picker sections need the exact same reduced-motion note, differing only in what they name. How: This returns the note paragraph while redMotBoo is true, or null to render nothing.


		<p className='settings-sub set-rm-note'>Your system is set to reduce motion, so { namTexStr } will not play in the app. You can still preview each one here.</p> // What: Set Rm Note Paragraph Element. Why: This is the actual note copy, naming whichever feature the caller passed in. How: This renders namTexStr inline inside the fixed surrounding sentence.


	) : null;



	// #region Daily Generator Notifications

	// Permission is asked exactly once, from the run-time change gesture: that
	// is the moment the user has shown they care when the generator runs, and
	// a denied prompt can't be re-shown by us.
	const [ notPerStr, setNotPerStr ] = React.useState( () => ( NOT_NAM_OBJ ? NOT_NAM_OBJ.perCheFun() : 'unsupported' ) ); // What: Notification Permission String And Setter. Why: The notify-me row needs the browser's own current notification permission to decide which of its 3 states to show. How: This starts from an immediate NOT_NAM_OBJ.perCheFun() check, then is kept in sync by the effect below.

	React.useEffect( () => { // What: Notification Permission Subscribe Effect. Why: notPerStr needs to update live if permission changes outside this row's own controls, such as via the browser's own site settings. How: This subscribes to NOT_NAM_OBJ's own change notifications and cleans up on unmount.


		if ( !NOT_NAM_OBJ ) return; // What: No Notification Support Guard. Why: An environment without notification support at all has nothing to subscribe to. How: This bails out of the effect entirely when NOT_NAM_OBJ is unavailable.



		return NOT_NAM_OBJ.subAddFun( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); // What: Permission Subscribe Return. Why: This both wires up the live subscription and returns its own unsubscribe function for cleanup. How: This calls NOT_NAM_OBJ.subAddFun with a handler that refreshes notPerStr, returning the subscription's own teardown function directly.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes; NOT_NAM_OBJ itself is a stable module-level import.

	const onRunChaFun = ( newTimStr ) => { // What: On Run Change Function. Why: Changing the run-time is the one deliberate gesture this section asks notification permission from. How: This saves the new run time, then (if supported) asks for permission exactly once.


		actions.setDailyRunTime( newTimStr ); // What: Run Time Save Call. Why: This is the actual persisted setting the Daily generator reads to know when to run. How: This calls actions.setDailyRunTime with newTimStr.

		if ( NOT_NAM_OBJ ) NOT_NAM_OBJ.askOncFun().then( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); // What: Ask Once Call. Why: This specific gesture is the one moment this app ever asks for notification permission unprompted. How: This calls NOT_NAM_OBJ.askOncFun, refreshing notPerStr once it resolves.


	};

	const enaNotFun = () => { if ( NOT_NAM_OBJ ) NOT_NAM_OBJ.reqPerFun().then( () => setNotPerStr( NOT_NAM_OBJ.perCheFun() ) ); }; // What: Enable Notification Function. Why: The notify-me row's own explicit Enable button needs a direct way to (re-)request permission. How: This calls NOT_NAM_OBJ.reqPerFun, refreshing notPerStr once it resolves.

	// #endregion Daily Generator Notifications



	// #region Storage And Installation

	// Reports where the data actually lives, whether the browser has promised
	// not to evict it, and how fresh the fallback copy is. Refreshed on mount
	// and whenever the PWA layer changes (install, persistence grant).
	const [ stoStaObj, setStoStaObj ] = React.useState( null ); // What: Storage Status Object And Setter. Why: The Data Control section's "Where your data lives" row needs the real, live storage status to render at all. How: This is populated by the effect below and read throughout the Data Control section.
	const [ pwaTikNum, setPwaTikNum ] = React.useState( 0 );    // What: Pwa Tick Number And Setter. Why: A PWA-layer change (install, persistence grant) needs to force a re-render even though it doesn't directly change any other piece of state here. How: This is incremented by the effect below whenever PWA_NAM_OBJ.subscribe fires, and is otherwise unread.
	const [ perMesObj, setPerMesObj ] = React.useState( null ); // What: Persist Message Object And Setter. Why: Both the Install and Protect Data actions need somewhere to report their own outcome. How: This is set by onInsFun/onPerFun and rendered as a status line in the storage row.

	React.useEffect( () => { // What: Storage Status Effect. Why: The storage row needs to read real, live status on mount and stay in sync with any later PWA-layer change. How: This reads STORAGE.status() once immediately, then again every time PWA reports a change, guarding against a result landing after unmount.


		let mntAliBoo = true; // What: Mount Alive Boolean. Why: An async STORAGE.status() read must not update state after this component has already unmounted. How: This starts true and is flipped false in this effect's own cleanup, checked before every state write below.

		const rdStaFun = () => { // What: Read Status Function. Why: This centralizes the actual status read so both the immediate call and the PWA-subscribe handler share the same logic. How: This calls STORAGE.status() and writes the result into stoStaObj, but only while still mounted.


			if ( !STORAGE ) return; // What: No Storage Guard. Why: An environment somehow missing the storage layer entirely has nothing to read. How: This bails out early when STORAGE is unavailable.

			STORAGE.status().then( ( staResObj ) => { if ( mntAliBoo ) setStoStaObj( staResObj ); } ); // What: Status Read Call. Why: This is the actual async read of where/how data is currently stored. How: This resolves STORAGE.status() and writes its result into stoStaObj, guarded by mntAliBoo.


		};


		rdStaFun(); // What: Initial Status Read. Why: The row should already show real status on mount, without waiting for a PWA-layer change. How: This invokes rdStaFun once, synchronously (its own internal read is still async).

		const pwaOffFun = PWA_NAM_OBJ ? PWA_NAM_OBJ.subscribe( () => { setPwaTikNum( ( tikCurNum ) => tikCurNum + 1 ); rdStaFun(); } ) : null; // What: Pwa Off Function. Why: An install or persistence-grant event can change both the storage status and the install/standalone flags read below. How: This subscribes to PWA_NAM_OBJ's own change notifications, bumping pwaTikNum and re-reading status on every one, keeping PWA_NAM_OBJ's own unsubscribe function for cleanup.



		return () => { mntAliBoo = false; if ( pwaOffFun ) pwaOffFun(); }; // What: Effect Cleanup Function. Why: Both the alive flag and the PWA subscription must be torn down together on unmount. How: This flips mntAliBoo false and calls pwaOffFun, if one was actually created.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up its own subscription once, on mount. How: An empty array means it never re-subscribes; STORAGE and PWA_NAM_OBJ are stable module-level imports.

	const isaStaBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaStaFun() ); // What: Is-A Standalone Boolean. Why: Several install-related rows below need to know whether the app is already running installed/standalone. How: This calls PWA_NAM_OBJ.isaStaFun(), guarded against PWA_NAM_OBJ itself being unavailable.
	const canInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.canInsFun() );   // What: Can Install Boolean. Why: The Install button itself should only render while an install prompt is actually available. How: This calls PWA_NAM_OBJ.canInsFun(), guarded against PWA_NAM_OBJ itself being unavailable.
	const iosInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaIosBoo && !isaStaBoo ); // What: Ios Install Boolean. Why: iOS/iPadOS need their own "Add to Home Screen" instructions instead of the native install prompt. How: This is true only when PWA_NAM_OBJ reports isaIosBoo and the app is not already standalone.
	const macInsBoo = !!( PWA_NAM_OBJ && PWA_NAM_OBJ.isaMacBoo && !isaStaBoo ); // What: Mac Install Boolean. Why: macOS Safari needs its own "Add to Dock" instructions instead of the native install prompt. How: This is true only when PWA_NAM_OBJ reports isaMacBoo and the app is not already standalone.
	// Feature-detected rather than named-browser: 'unsupported' covers Firefox
	// and anything else without the install prompt, and stays 'pending' until
	// we have actually waited long enough to know.
	const insStaStr = ( PWA_NAM_OBJ && PWA_NAM_OBJ.insStaFun ) ? PWA_NAM_OBJ.insStaFun() : 'pending'; // What: Install State String. Why: The Data Control section's own install-related messaging branches on this exact value. How: This calls PWA_NAM_OBJ.insStaFun(), falling back to 'pending' when that method itself is unavailable.

	const forBytFun = ( bytNum ) => { // What: Format Byte Function. Why: The storage row needs a human-readable size, not a raw byte count. How: This picks whichever of B/KB/MB unit reads most naturally for bytNum's own magnitude.


		if ( bytNum == null ) return '—'; // What: Missing Bytes Guard. Why: A not-yet-known size should render as a placeholder dash, not "undefined B". How: This returns the em-dash placeholder glyph whenever bytNum is null/undefined.
		if ( bytNum < 1024 ) return bytNum + ' B'; // What: Byte Unit Branch. Why: A very small size reads most naturally in plain bytes. How: This returns bytNum suffixed with ' B' whenever it is under 1024.
		if ( bytNum < 1024 * 1024 ) return ( bytNum / 1024 ).toFixed( 0 ) + ' KB'; // What: Kilobyte Unit Branch. Why: A size under 1MB reads most naturally in whole kilobytes. How: This divides bytNum by 1024, rounds to a whole number, and suffixes it with ' KB'.



		return ( bytNum / 1048576 ).toFixed( 1 ) + ' MB'; // What: Megabyte Unit Return. Why: Anything larger reads most naturally in megabytes with 1 decimal of precision. How: This divides bytNum by 1048576 and suffixes it with ' MB'.


	};

	const forWhnFun = ( isoStr ) => { // What: Format When Function. Why: The storage row's "fallback copy" fact needs a friendly relative-or-absolute label, not a raw ISO timestamp. How: This special-cases "never" and "today", otherwise falling back to a short absolute date, catching any parse failure along the way.


		if ( !isoStr ) return 'not yet this install'; // What: Missing Timestamp Guard. Why: A fallback copy that has never actually been written needs its own distinct label. How: This returns a fixed "not yet this install" string whenever isoStr is falsy.

		try {


			const datObj = new Date( isoStr ), nowObj = new Date();                                          // What: Date Object And Now Object. Why: Deciding between "today" and an absolute date requires comparing the timestamp against the current moment. How: These are compared via their own toDateString() below.
			const samDayBoo = datObj.toDateString() === nowObj.toDateString();                                // What: Same Day Boolean. Why: A same-calendar-day timestamp reads more naturally as "today" than as a repeated date. How: This compares datObj's own toDateString() against nowObj's.
			const timStr    = datObj.toLocaleTimeString( [], { hour : 'numeric', minute : '2-digit' } );      // What: Time String. Why: Both the "today" and absolute-date branches need the same formatted time-of-day suffix. How: This formats datObj as a locale time with no seconds.



			return samDayBoo ? `today at ${ timStr }` : datObj.toLocaleDateString( [], { month : 'short', day : 'numeric' } ) + ` at ${ timStr }`; // What: Formatted When Return. Why: This is the function's whole purpose, a friendly relative-or-absolute label. How: This returns "today at TIME" for a same-day timestamp, otherwise a short locale month/day date plus "at TIME".


		}

		catch ( e ) { return 'unknown'; }


	};

	const onInsFun = async () => { // What: On Install Function. Why: The Install button's own click handler needs to run the real install prompt and report its outcome. How: This awaits PWA_NAM_OBJ.askInsFun() and sets perMesObj based on whether the user accepted or dismissed it.


		const insResStr = await PWA_NAM_OBJ.askInsFun(); // What: Install Result String. Why: The actual outcome ('accepted' | 'dismissed') decides which message to show. How: This awaits PWA_NAM_OBJ's own askInsFun() call.

		if ( insResStr === 'accepted' ) setPerMesObj( { ok : true, text : 'Installed. Your data is now protected from browser cleanup.' } ); // What: Accepted Branch. Why: A successful install is worth confirming, including that it also protects the user's data. How: This sets perMesObj to a success message whenever insResStr is 'accepted'.

		else if ( insResStr === 'dismissed' ) setPerMesObj( { ok : false, text : 'Install dismissed.' } ); // What: Dismissed Branch. Why: An explicitly dismissed prompt is still worth a small acknowledgement. How: This sets perMesObj to a neutral message whenever insResStr is 'dismissed'.


	};

	const onPerFun = async () => { // What: On Persist Function. Why: The Protect Data button's own click handler needs to run the real persistence request and report its outcome. How: This awaits PWA_NAM_OBJ.askPerFun(), sets perMesObj accordingly, then refreshes the storage status row.


		const perOkaBoo = await PWA_NAM_OBJ.askPerFun( true ); // What: Persist Okay Boolean. Why: Whether the browser actually granted persistence decides which message to show. How: This awaits PWA_NAM_OBJ's own askPerFun(true) call.


		setPerMesObj( perOkaBoo // What: Persist Message Update. Why: The user needs to know whether the grant actually happened, and what to do next if it didn't. How: This sets a success message when perOkaBoo is true, otherwise a message suggesting installing the app instead.


			? { ok : true, text : 'Granted. This browser will not evict your data.' }
			: { ok : false, text : 'The browser declined for now. Installing the app is the surest way to get it.' }


		);

		if ( STORAGE ) STORAGE.status().then( setStoStaObj ); // What: Storage Status Refresh Call. Why: A persistence grant is itself a change the storage row's own status should immediately reflect. How: This re-reads STORAGE.status() and writes the result straight into stoStaObj.


	};

	// #endregion Storage And Installation



	// #region Data Control Export And Import

	const filInpRef = React.useRef( null ); // What: File Input Reference. Why: The Import button itself is not the real file input; it needs a handle on the real (visually hidden) one to trigger its own click. How: This is attached to the hidden file input's own ref prop below.
	// Both actions hand focus away (export appends and clicks a download link,
	// import opens the file dialog), leaving focus on <body> where a screen
	// reader starts reading the browser and page title. Refocus the button
	// that was used and annStaFun through the app-level live region.
	const expButRef = React.useRef( null );                     // What: Export Button Reference. Why: expDatFun needs a handle on the Export button to restore focus to it after the download link is clicked. How: This is attached to the Export ButBasCom's own ref prop below.
	const impButRef = React.useRef( null );                     // What: Import Button Reference. Why: Both onImpFun's own failure path and the focus-restore effect below need a handle on the Import button. How: This is attached to the Import ButBasCom's own ref prop below.
	const [ impMesObj, setImpMesObj ] = React.useState( null ); // What: Import Message Object And Setter. Why: A completed (or failed) import needs somewhere to report its own outcome once the confirmation itself is gone. How: This is rendered as a status line below the import row.
	// Parsed-but-unconfirmed backup. Replaces a native confirm(), which the
	// browser owns and no screen reader can be told about.
	const [ penImpObj, setPenImpObj ] = React.useState( null ); // What: Pending Import Object And Setter. Why: A chosen backup file must be confirmed in-app before it actually replaces all data. How: This holds the parsed { name, data } pair while the confirm row is showing, read by doImpFun.
	const [ impLeaBoo, setImpLeaBoo ] = React.useState( false ); // What: Import Leaving Boolean And Setter. Why: Closing the import confirmation should play its own leave animation before actually unmounting. How: This flags the confirm row as leaving for the duration of that animation.
	const impConRef = React.useRef( null ); // What: Import Confirm Reference. Why: Opening the confirmation should move focus onto its own Import button. How: This is attached to that button's own ref prop below.
	// Set when a confirm closes; consumed by the effect that runs after the
	// Import button has actually remounted, so focus never lands on <body>.
	const impFocRef = React.useRef( false ); // What: Import Focus Reference. Why: The commit where the real Import button remounts happens after this closing function returns, so a plain synchronous focus call here would be too early. How: This flags that focus should be restored, consumed by the effect below once penImpObj is actually cleared.
	const [ expMesObj, setExpMesObj ] = React.useState( null ); // What: Export Message Object And Setter. Why: A completed export needs somewhere to report how many history entries it actually included. How: This is rendered as a status line below the export row.
	const [ conResBoo, setConResBoo ] = React.useState( false ); // What: Confirm Reset Boolean And Setter. Why: The Reset row needs to know whether its own confirm pair is currently showing. How: This swaps the Reset button for the confirm pair below.
	const [ resLeaBoo, setResLeaBoo ] = React.useState( false ); // What: Reset Leaving Boolean And Setter. Why: Closing the reset confirmation should play its own leave animation before actually unmounting. How: This flags the confirm row as leaving for the duration of that animation.
	const [ resMesStr, setResMesStr ] = React.useState( null ); // What: Reset Message String And Setter. Why: A completed reset needs somewhere to report its own outcome, once the row's own Reset button has gone away. How: This is rendered as a status line below the reset row.
	// Same unmount-on-swap problem as the import row: the trigger button is
	// replaced by the confirm pair, so focus has to be moved deliberately in
	// the commit AFTER each swap or it falls to <body>.
	const resButRef = React.useRef( null ); // What: Reset Button Reference. Why: Closing the confirmation without resetting should return focus to the row's own Reset button. How: This is attached to that button's own ref prop below.
	const resConRef = React.useRef( null ); // What: Reset Confirm Reference. Why: Opening the confirmation should move focus onto its own Reset button. How: This is attached to that button's own ref prop below.
	const resFocRef = React.useRef( false ); // What: Reset Focus Reference. Why: The commit where the real Reset button remounts happens after the closing function returns, so a plain synchronous focus call here would be too early. How: This flags that focus should be restored, consumed by the effect below once conResBoo is actually cleared.
	// Something to reset? True if the user has created any pickers, items,
	// conditionals, reminders, groups, or accrued any pick/completion history.
	const hasDatBoo = !!( ( state.pickers && state.pickers.length ) || ( state.items && state.items.length ) || ( state.conditionals && state.conditionals.length ) || ( state.tasks && state.tasks.length ) || ( state.pickLog && state.pickLog.length ) || ( state.conditionalLog && state.conditionalLog.length ) || ( state.groups && state.groups.length ) ); // What: Has Data Boolean. Why: Both the Export and Reset rows need to know whether there is actually anything to export/reset at all. How: This is true whenever any one of the 7 listed collections is non-empty.

	const cloResFun = () => { // What: Close Reset Confirm Function. Why: Backing out of the reset confirmation (via Cancel or Escape) needs the same leave-then-unmount handling as every other confirm here. How: This flags focus for restoration, then either closes immediately (reduced motion) or plays the leave animation first.


		resFocRef.current = true; // What: Reset Focus Flag Set. Why: The focus-restore effect below needs to know this specific close was a real "back out" rather than a successful reset. How: This flags resFocRef true, consumed once conResBoo actually flips back to false.

		if ( redMotFun() ) { setConResBoo( false ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see the confirm pair close immediately, not play a leave animation. How: This closes the confirm immediately and bails out whenever redMotFun() reports true.


		setResLeaBoo( true ); // What: Reset Leaving Flag Set. Why: This is what actually triggers the leave animation's own CSS class. How: This flags resLeaBoo true.

		setTimeout( () => { setConResBoo( false ); setResLeaBoo( false ); }, 150 ); // What: Delayed Close Call. Why: The confirm pair must not actually unmount until its own leave animation has had time to play. How: This waits 150ms, then closes the confirm and clears the leaving flag together.


	};

	// Escape backs out of the reset confirmation, like the other confirms.
	useEscCanFun( conResBoo && !resLeaBoo, cloResFun ); // What: Escape Cancel Subscription. Why: Every confirmation in this tab backs out on Escape, and the reset confirm is no exception. How: This calls useEscCanFun, active only while the confirm is open and not already leaving, invoking cloResFun.

	React.useEffect( () => { // What: Reset Focus Effect. Why: Focus must follow the swap between the Reset button and the confirm pair in both directions, since the element under it is unmounted/remounted each time. How: This focuses the confirm's own Reset button on open, or restores focus to the row's own Reset button on a deliberate close.


		if ( conResBoo ) { if ( resConRef.current ) resConRef.current.focus(); return; } // What: Confirm Open Focus Guard. Why: Opening the confirm should move focus onto its own, now-visible Reset button. How: This focuses resConRef's own current element and bails out of the rest of the effect whenever conResBoo is true.

		if ( !resFocRef.current ) return; // What: No Pending Restore Guard. Why: A close that happened via a real reset (not a Cancel/Escape) has nowhere to restore focus to. How: This bails out whenever resFocRef was never actually flagged.

		resFocRef.current = false; // What: Reset Focus Flag Clear. Why: This restore should only ever fire once per close. How: This clears resFocRef back to false immediately, before the focus call below.

		if ( resButRef.current ) resButRef.current.focus(); // What: Reset Button Focus Call. Why: This is the actual focus restoration, back to the row's own Reset button. How: This focuses resButRef's own current element, if it is mounted.


	}, [ conResBoo ] ); // What: Effect Dependency Array. Why: This must re-run every time the confirm pair opens or closes, since each direction needs its own focus move. How: conResBoo is the single value both directions of this effect are built around.


	const expDatFun = async () => { // What: Export Data Function. Why: The Export button needs to build and download a full backup, sourced from the true persisted state rather than only in-memory state. How: This reads the freshest available pick log, builds a JSON blob, announces the result, then triggers the download.


		// Export from the STORE OF RECORD, not just memory. If this session
		// booted from the warm localStorage mirror (which omits the pick log),
		// the in-memory log is empty and a naive export would silently drop
		// all history, so the Stats tab would come back blank after a
		// round-trip.
		let expPayObj = state; // What: Export Payload Object. Why: The exported backup needs one single object to serialize, defaulting to the in-memory state. How: This starts as state itself and is only replaced below if a fresher persisted pick log is actually found.

		try {


			if ( STORAGE && STORAGE.readPersisted ) {


				const perStaObj = await STORAGE.readPersisted(); // What: Persisted State Object. Why: The real persisted pick log may be longer than whatever this session's in-memory state currently holds. How: This awaits STORAGE's own readPersisted() call.

				if ( perStaObj && Array.isArray( perStaObj.pickLog ) && perStaObj.pickLog.length > ( state.pickLog || [] ).length ) expPayObj = { ...state, pickLog : perStaObj.pickLog }; // What: Fresher Pick Log Swap. Why: Only an actually-longer persisted pick log is worth swapping in; a shorter or equal one is not. How: This overwrites expPayObj's own pickLog with perStaObj's, keeping every other field from state.


			}


		}

		catch ( e ) { /* fall back to in-memory state */ }

		const entCouNum = ( expPayObj.pickLog || [] ).length;                            // What: Entry Count Number. Why: Both the announcement and the on-screen status line need to say how many history entries the export actually included. How: This reads the length of expPayObj's own (possibly swapped-in) pickLog.
		const expBlbObj = new Blob( [ JSON.stringify( expPayObj, null, 2 ) ], { type : 'application/json' } ); // What: Export Blob Object. Why: A downloadable file needs to exist as a real Blob, not just a JS object. How: This serializes expPayObj as pretty-printed JSON inside a JSON-typed Blob.
		const expUrlStr = URL.createObjectURL( expBlbObj );                              // What: Export Url String. Why: A Blob needs an object URL before a real download link can reference it. How: This creates a temporary object URL for expBlbObj, revoked further below once the download has started.
		const dowLnkEle = document.createElement( 'a' );                                 // What: Download Link Element. Why: Triggering a file download from script requires a real, if never-inserted, anchor element. How: This is configured below with its own href/download attributes, then clicked without ever being appended to the document.
		const datStmStr = new Date().toISOString().slice( 0, 10 );                       // What: Date Stamp String. Why: The downloaded filename should carry today's own date for easy identification. How: This takes the first 10 characters of an ISO timestamp, i.e. its own "YYYY-MM-DD" date portion.

		dowLnkEle.href     = expUrlStr; // What: Download Href Assignment. Why: This is what actually points the anchor at the freshly-built backup blob. How: This sets dowLnkEle's own href to expUrlStr.
		dowLnkEle.download = `ease-my-life-${ datStmStr }.json`; // What: Download Filename Assignment. Why: A named download attribute is what gives the saved file a sensible name instead of a random blob id. How: This sets dowLnkEle's own download attribute to a dated, app-branded filename.

		setExpMesObj( { t : Date.now(), entries : entCouNum } ); // What: Export Message Update. Why: The on-screen status line needs both a fresh React key and the actual entry count. How: This writes a timestamp/entries pair into expMesObj.

		// Announce BEFORE firing the download. The browser's own download UI
		// takes focus the moment the link is clicked, and a screen reader that
		// follows focus into browser chrome drops any pending polite
		// announcement, so the speech has to be assertive and already under
		// way. The file is fully built by this point, so "exported" is true
		// when it is said.
		annStaFun( `Backup exported, including ${ entCouNum } history ${ entCouNum === 1 ? 'entry' : 'entries' }.`, { assertive : true } ); // What: Export Announce Call. Why: A screen-reader user needs to hear the export actually happened, including how much history it carried. How: This announces the entry count assertively, pluralized correctly for exactly 1 entry.

		setTimeout( () => { // What: Download Trigger Timeout. Why: The announcement above needs a brief head start before the download link steals focus. How: This waits 220ms, then clicks the anchor, restores focus, and schedules the object URL's own cleanup.


			// Never put the anchor in the document: appending it and clicking it
			// is what moved focus to <body>. A detached anchor downloads
			// identically. Focus is then re-asserted on the button, so if the
			// browser's download UI does not grab it, focus stays somewhere
			// meaningful.
			dowLnkEle.click(); // What: Download Click Call. Why: This is the actual trigger that starts the file download. How: This calls click() on the never-inserted dowLnkEle.

			if ( expButRef.current ) expButRef.current.focus(); // What: Export Button Focus Call. Why: Focus should land somewhere meaningful even if the browser's own download UI does not claim it. How: This focuses expButRef's own current element, if mounted.

			setTimeout( () => URL.revokeObjectURL( expUrlStr ), 1000 ); // What: Object Url Revoke Timeout. Why: The temporary object URL must eventually be released, but not before the browser has had time to actually start the download. How: This revokes expUrlStr 1000ms after the click.


		}, 220 );


	};


	const onImpFun = ( chaEveObj ) => { // What: On Import File Function. Why: Choosing a backup file needs to be parsed and held for in-app confirmation before it can actually replace all data. How: This reads the chosen file as text, parses it as JSON, and either stages it as penImpObj or reports a read failure.


		const impFilObj = chaEveObj.target.files && chaEveObj.target.files[ 0 ]; // What: Import File Object. Why: The native file input may have no file chosen at all, such as a cancelled dialog. How: This reads the first (and only) selected file, or undefined.

		chaEveObj.target.value = ''; // What: File Input Reset. Why: Re-selecting the exact same file later must still fire a fresh change event. How: This clears the native input's own value back to empty.

		if ( !impFilObj ) return; // What: No File Guard. Why: A cancelled file dialog leaves nothing to read. How: This bails out early whenever impFilObj is falsy.

		const filRdrObj = new FileReader(); // What: File Reader Object. Why: Reading a File's own text contents requires the FileReader API. How: This is configured below via its own onload handler, then started with readAsText.

		filRdrObj.onload = () => { // What: File Reader Onload Handler. Why: The file's own text is only available once this callback fires. How: This parses the read text as JSON, validating it looks like a real backup before staging it.


			try {


				const impDatObj = JSON.parse( filRdrObj.result ); // What: Import Data Object. Why: A backup file's own contents must be valid JSON before anything else can happen. How: This parses filRdrObj's own result string.

				if ( !impDatObj || !Array.isArray( impDatObj.pickers ) ) throw new Error( 'Not an Ease My Life backup.' ); // What: Shape Validation Guard. Why: Arbitrary JSON that merely parses is not necessarily a real backup. How: This throws, routing to the catch below, whenever the parsed object is missing or has no real pickers array.

				// Hold the parsed backup and ask in-app. No separate
				// announcement: the file dialog closing already sends the
				// reader through browser chrome, and an assertive message on
				// top of that lands third, after its own noise and the focus
				// move. Instead focus moves (a little late, so the dialog
				// transition has settled) to the confirm button, whose name
				// plus aria-describedby warning is read as a single utterance.
				setImpMesObj( null ); // What: Import Message Clear. Why: A fresh file choice should not carry over a stale message from an earlier attempt. How: This clears impMesObj back to null.

				setPenImpObj( { name : impFilObj.name, data : impDatObj } ); // What: Pending Import Set. Why: This is what actually surfaces the in-app confirmation row below. How: This stages the file's own name and parsed data together.

				setTimeout( () => { if ( impConRef.current ) impConRef.current.focus(); }, 300 ); // What: Confirm Focus Timeout. Why: Focus must wait for the file dialog's own close transition to settle before landing on the confirm button. How: This focuses impConRef's own current element 300ms later.


			}

			catch ( e ) {


				setPenImpObj( null ); // What: Pending Import Clear. Why: A failed parse must not leave a stale pending confirmation around. How: This clears penImpObj back to null.

				setImpMesObj( { ok : false, text : "That file couldn't be read as a backup." } ); // What: Import Failure Message. Why: The user needs to know clearly that this specific file did not work. How: This sets impMesObj to a fixed failure message.

				if ( impButRef.current ) impButRef.current.focus(); // What: Import Button Focus Call. Why: Focus should return to a real, actionable control after a failed read. How: This focuses impButRef's own current element, if mounted.

				annStaFun( "That file couldn't be read as a backup.", { assertive : true } ); // What: Import Failure Announce Call. Why: A screen-reader user needs to hear the failure too, not just see it. How: This announces the same fixed failure message, assertively.


			}


		};

		filRdrObj.readAsText( impFilObj ); // What: Read As Text Call. Why: This is what actually starts the async file read that filRdrObj.onload above responds to. How: This reads impFilObj as plain text.


	};


	const cloImpFun = () => { // What: Close Import Confirm Function. Why: Backing out of (or completing) the import confirmation needs the same leave-then-unmount handling as the reset confirmation. How: This flags focus for restoration, then either closes immediately (reduced motion) or plays the leave animation first.


		// Focus restore is driven by a commit-watching effect below, not from
		// here: the Import button is unmounted while the confirm pair shows,
		// and a requestAnimationFrame guess can run before React commits the
		// remount.
		impFocRef.current = true; // What: Import Focus Flag Set. Why: The focus-restore effect below needs to know this close should restore focus once the real Import button remounts. How: This flags impFocRef true.

		if ( redMotFun() ) { setPenImpObj( null ); setImpLeaBoo( false ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see the confirm pair close immediately, not play a leave animation. How: This closes the confirm immediately and bails out whenever redMotFun() reports true.


		setImpLeaBoo( true ); // What: Import Leaving Flag Set. Why: This is what actually triggers the leave animation's own CSS class. How: This flags impLeaBoo true.

		setTimeout( () => { setPenImpObj( null ); setImpLeaBoo( false ); }, 150 ); // What: Delayed Close Call. Why: The confirm pair must not actually unmount until its own leave animation has had time to play. How: This waits 150ms, then clears the pending import and the leaving flag together.


	};

	const doImpFun = () => { // What: Do Import Function. Why: Confirming the pending import needs to actually replace all data and report success. How: This calls actions.importData with the staged backup, announces and reports success, then closes the confirmation.


		if ( !penImpObj ) return; // What: No Pending Import Guard. Why: There is nothing to confirm if the confirmation was somehow triggered without a staged backup. How: This bails out early whenever penImpObj is null.

		actions.importData( penImpObj.data ); // What: Import Data Call. Why: This is the actual store mutation that replaces all data with the staged backup. How: This calls actions.importData with penImpObj's own parsed data.

		setImpMesObj( { ok : true, text : 'Backup imported.' } ); // What: Import Success Message. Why: A status line should confirm the import once the confirmation row itself is gone. How: This sets impMesObj to a fixed success message.

		annStaFun( 'Backup imported.' ); // What: Import Success Announce Call. Why: A screen-reader user needs to hear the success too, not just see it. How: This announces the same fixed success message.

		cloImpFun(); // What: Confirm Close Call. Why: A completed import should close the confirmation the same way cancelling it does. How: This calls cloImpFun to play the leave animation and eventually unmount the confirm pair.


	};

	const cnlImpFun = () => { // What: Cancel Import Function. Why: Explicitly cancelling should discard the staged backup and confirm nothing happened, distinct from a silent Escape dismissal. How: This announces the cancellation, then closes the confirmation the same way a successful import does.


		if ( !penImpObj ) return; // What: No Pending Import Guard. Why: There is nothing to cancel if no backup is actually staged. How: This bails out early whenever penImpObj is null.

		annStaFun( 'Import cancelled.' ); // What: Import Cancelled Announce Call. Why: A screen-reader user needs to hear the cancellation too, not just see the row close. How: This announces a fixed cancellation message.

		cloImpFun(); // What: Confirm Close Call. Why: A cancelled import should close the confirmation the same way a completed one does. How: This calls cloImpFun to play the leave animation and eventually unmount the confirm pair.


	};

	// Escape backs out of the import confirmation, like every other confirm
	// here.
	useEscCanFun( !!penImpObj && !impLeaBoo, cnlImpFun ); // What: Escape Cancel Subscription. Why: Every confirmation in this tab backs out on Escape, and the import confirm is no exception. How: This calls useEscCanFun, active only while a backup is staged and not already leaving, invoking cnlImpFun.

	React.useEffect( () => { // What: Import Focus Effect. Why: Focus must be restored to the real Import button only in the commit where it has actually remounted back into the tree. How: This checks impFocRef, consuming the flag and focusing impButRef only once penImpObj has actually cleared.


		if ( penImpObj || !impFocRef.current ) return; // What: No Restore Needed Guard. Why: There is nothing to restore while the confirm is still showing, or if this close never flagged a restore. How: This bails out whenever either condition holds.

		impFocRef.current = false; // What: Import Focus Flag Clear. Why: This restore should only ever fire once per close. How: This clears impFocRef back to false immediately, before the focus call below.

		if ( impButRef.current ) impButRef.current.focus(); // What: Import Button Focus Call. Why: This is the actual focus restoration, back to the row's own Import button. How: This focuses impButRef's own current element, if it is mounted.


	}, [ penImpObj ] ); // What: Effect Dependency Array. Why: This must re-run every time the pending import is set or cleared, since the restore can only happen once the button has actually remounted. How: penImpObj is the single value this effect's own change-detection is built around.

	// #endregion Data Control Export And Import


	const picCouNum = ( state.pickers || [] ).length;               // What: Picker Count Number. Why: The export row's own description names exactly how many pickers a backup would include. How: This reads the length of state.pickers, defaulting to an empty array.
	const iteCouNum = ( state.items || [] ).length;                 // What: Item Count Number. Why: The export row's own description names exactly how many items a backup would include. How: This reads the length of state.items, defaulting to an empty array.
	const remCouNum = ( state.tasks || [] ).length;                 // What: Reminder Count Number. Why: The export row's own description names exactly how many reminders a backup would include. How: This reads the length of state.tasks, defaulting to an empty array.
	const dlyIdeArr = ( state.daily && state.daily.pickerIds ) || []; // What: Daily Id Array. Why: This mirrors the persisted daily picker-id list for parity with the rest of this component's own derived values, though nothing here currently reads it further. How: This reads state.daily's own pickerIds, defaulting to an empty array.
	const dlyModStr = ( state.daily && state.daily.mode ) || 'auto'; // What: Daily Mode String. Why: The Daily generator section's own copy and controls all branch on whether the generator runs automatically or manually. How: This reads state.daily's own mode, defaulting to 'auto'.



	const braMarCli = 'braMarCliSet'; // What: Brand Mark Clippath Id. Why: This header renders the same logo svg as the Today/Stats/Data headers, and clipPath ids must be document-unique. How: This is a fixed, file-specific id, distinct from the other headers' own "braMarCli".



	return (


		<div
			className='tab tab--settings'
			ref={ rooEleRef }
		>{ /* What: Tab Settings Div Element. Why: This is TabSettings's own root element, giving the scroll-spy effect a handle to find its nearest '.main' ancestor. How: This wraps the header, the section rail plus right-hand pane, and the Legal modal. */ }


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

				<div className='stat-h-lead'>{ /* What: Stat H Lead Div Element. Why: The brand mark and the page title sit side by side in this same lead row on every tab. How: This wraps the brand-mark button and the section title. */ }


					<button
						type='button'
						className='brand-mark'
						aria-label='Ease My Life link to go to the Today page'
						onClick={ onHomFun }
					>{ /* What: Brand Mark Button Element. Why: The logo doubles as a shortcut back to the Today tab, same as every other header. How: This calls onHomFun when clicked. */ }


						{ /* Same theme-wired logo as the Today + Stats + Data headers. */ }
						<svg
							viewBox='8 8 528 528'
							fill='none'
							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id={ braMarCli }
									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }


									<rect
										width='512'
										height='512'
										y='16'
										x='16'
										rx='75'
										ry='75'
									/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


								</clipPath>


							</defs>

							<g style={{ stroke : 'var(--accent-soft)', strokeWidth : 16 }}>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


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
								width='512'
								height='512'
								y='16'
								x='16'
								rx='75'
								ry='75'
								style={{ strokeWidth : 16, strokeLinecap : 'round', strokeLinejoin : 'round', stroke : 'currentColor' }}
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeWidth='8'
								strokeLinecap='round'
								strokeLinejoin='round'
								clipPath={ `url(#${ braMarCli })` }
								style={{ fill : 'currentColor', stroke : 'currentColor' }}
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>

					<div className='section-h'>{ /* What: Section H Div Element. Why: The page title needs its own small wrapper, matching every other tab's header. How: This wraps the h1 title below. */ }


						<h1 className='section-title'>Behind the scenes, of your <span className='stat-title-accent'>eased</span> life.</h1>{ /* What: Section Title H1 Element. Why: Every tab names its own page with this same title style. How: This renders the fixed title text, with "eased" set off in the shared accent span. */ }


					</div>


				</div>

				<p className='section-sub'>All app-wide settings can be found here relating to the app's appearance, the Daily generator, holiday preferences, app data import, export, and deletion, user account, about and legal. All conditionals, reminders, pickers and their items' settings can found in the <button type='button' className='sub-tablink' onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }>Data page</button>.</p>{ /* What: Section Sub Paragraph Element. Why: Every tab's header ends with this same short intro paragraph. How: This renders the fixed intro copy, with a link to the Data tab via onNavTabFun. */ }


			</header>

			<div className='settings-layout'>{ /* What: Settings Layout Div Element. Why: The section rail and the right-hand pane need to sit side by side. How: This wraps the rail aside and the settings-sections div. */ }


				<aside
					className='settings-rail'
					aria-label='Settings sections'
					ref={ railEleRef }
				>{ /* What: Settings Rail Aside Element. Why: This is the sticky/scrollable rail of section links tracked by scroll-spy and driven by jmpSecFun. How: This wraps the rail's own kicker and its scrolling <ul> of section links. */ }


					<div className='kicker rail-kicker'>Sections</div>{ /* What: Kicker Div Element. Why: The rail needs its own small heading, matching the kicker style used elsewhere. How: This renders the fixed text "Sections". */ }

					{ /* Own scrolling element, separate from .settings-rail itself; see
					    the fade-edge effect's own comment for why. */ }
					<div
						className='settings-rail-scroll'
						ref={ railScrRef }
					>{ /* What: Settings Rail Scroll Div Element. Why: The rail-fade effect needs a dedicated scrolling element distinct from the non-scrolling outer rail its classes are toggled on. How: This wraps the actual <ul> of section links. */ }


						<ul>{ /* What: Rail Link List Element. Why: One link is needed per entry in SET_SEC_ARR. How: This maps SET_SEC_ARR into one rail button per section. */ }


							{ SET_SEC_ARR.map( ( secConObj ) => ( // What: Section Link Map. Why: One rail link is needed per registered section, in the same fixed order the sections themselves render in. How: This maps SET_SEC_ARR to one <li><button> pair per entry, keyed by its own ideStr.


								<li key={ secConObj.ideStr }>{ /* What: Rail Link Li Element. Why: Every rail link needs its own list item, matching standard nav-list markup. How: This wraps the single rail-btn button below. */ }


									<button
										className={ ` rail-btn   ${ actSecStr === secConObj.ideStr ? 'is-on' : '' } ` }
										onClick={ () => jmpSecFun( secConObj.ideStr ) }
									>{ /* What: Rail Btn Button Element. Why: This is the actual clickable control that jumps to and highlights this specific section. How: This calls jmpSecFun with this section's own ideStr when clicked, and marks itself "is-on" while actSecStr matches. */ }


										<span className='rail-name'>{ secConObj.labStr }</span>{ /* What: Rail Name Span Element. Why: Every rail link needs its own visible section name. How: This renders secConObj's own labStr. */ }


									</button>


								</li>


							) ) }


						</ul>


					</div>


				</aside>

				<div className='settings-sections'>{ /* What: Settings Sections Div Element. Why: The right-hand pane holds every section's own real content, in the same fixed order as the rail. How: This renders one <section> per entry in SET_SEC_ARR, each registering itself into secMapRef via its own ref callback. */ }


					{ /* ── Appearance ─────────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--appearance'
						ref={ ( secCurEle ) => { secMapRef.current[ 'appearance' ] = secCurEle; } }
					>{ /* What: Appearance Section Element. Why: This is the Appearance section's own root, registering itself for scroll-spy/jump-to. How: This wraps the system-preference row, the Theme cards, the 2 style pickers, and the tab-placement control. */ }


						<div className='set-section-h'><span className='kicker'>Appearance</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Appearance" inside the shared kicker span. */ }

						<p className='settings-sub'>Control the appearance of Ease My life, including colors, animations and tab placement.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Appearance. */ }

						<div className='set-subsection set-subsection--systempref'>{ /* What: System Pref Subsection Div Element. Why: The system-preference toggle needs its own labeled subsection, first among Appearance's own controls. How: This wraps the toggle row's own CarSurCom. */ }


							<CarSurCom>{ /* What: Card Surface Component. Why: The toggle row needs the same bordered container as every other row in this tab. How: This wraps the system-preference row below. */ }


								<div className='set-data-row'>{ /* What: System Pref Row Div Element. Why: The label/description and the switch need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the switch button. */ }


									<div className='set-data-info'>{ /* What: System Pref Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the switch. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>System preference</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "System preference". */ }

										<span
											className='set-data-sub set-sub-fade'
											key={ String( !!appCurObj.autoSystem ) }
										>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the toggle's own state, and should fade between the 2 versions. How: This remounts (via its own boolean-string key) and renders one of 2 explanatory sentences depending on appCurObj.autoSystem. */ }


											{ appCurObj.autoSystem


												? <React.Fragment>Your <strong>system</strong> will apply light and dark themes <strong>according to its preferences</strong>. Whichever theme is selected below will apply its counterpart (e.g. Ink &rarr; Night) when applicable.</React.Fragment>
												: <React.Fragment>Themes will only be applied <strong>manually</strong> according to whichever preference you select in the options below.</React.Fragment> }


										</span>


									</div>

									<button
										className={ ` switch   ${ appCurObj.autoSystem ? 'is-on' : '' } ` }
										aria-pressed={ !!appCurObj.autoSystem }
										aria-label='System preference'
										onClick={ () => actions.setAppearanceAutoSystem( !appCurObj.autoSystem ) }
									><i /></button>{ /* What: System Pref Switch Button Element. Why: This is the actual control that flips between automatic and manual theme selection. How: This calls actions.setAppearanceAutoSystem with the toggled value when clicked. */ }


								</div>


							</CarSurCom>


						</div>

						<TheSecCom
							state={ state }
							actions={ actions }
						/>{ /* What: Theme Section Component. Why: The Light and Dark theme cards are substantial enough to live in their own component. How: This renders both cards, driven by the same shared state/actions this whole tab receives. */ }

						<div className='set-subsection set-subsection--celebration'>{ /* What: Celebration Subsection Div Element. Why: The completion-celebration style picker needs its own labeled subsection. How: This wraps its own heading, intro copy, reduced-motion note, and the style picker plus preview CarSurCom. */ }


							<div className='set-subsection-h'>Completion celebration</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Completion celebration". */ }

							<p className='settings-sub'>Pick which animation will play when all tasks are marked as completed inside of the Today page.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the celebration picker. */ }


							{ motNotFun( 'celebrations' ) /* What: Reduced Motion Note Call. Why: A user who prefers reduced motion needs to know this animation won't play on its own, only on demand here. How: This renders motNotFun's own note, naming "celebrations", or nothing while redMotBoo is false. */ }
							<CarSurCom
								padded={ false }
								className='style-radio-card'
							>{ /* What: Card Surface Component. Why: The style picker and its live preview stage need a shared, unpadded bordered container. How: This wraps StyRadCom and CelPreCom together. */ }


								<StyRadCom
									groupName='completionStyle'
									groupLabel='Completion celebration'
									value={ ( state.appearance && state.appearance.completionStyle ) || 'confetti' }
									options={ [


										{ value : 'confetti', label : 'Confetti', hint : 'A burst of accent-colored confetti drifts out across your cards.' },
										{ value : 'ripple',   label : 'Ripple',    hint : 'The progress ring ripples, and each card exhales in turn.' },
										{ value : 'sparkle',  label : 'Sparkle',  hint : 'Soft accent-colored sparkles twinkle briefly across your cards.' }


									] }
									previewDisabled={ false }
									onChange={ actions.setCompletionStyle }
									onPreview={ plyCelFun }
								/>{ /* What: Style Radio Component. Why: This is the actual celebration-style picker. How: This is bound to the persisted completionStyle, saving via actions.setCompletionStyle and previewing via plyCelFun. */ }

								<CelPreCom
									styKeyStr={ celStyStr }
									repTokNum={ celTokNum }
								/>{ /* What: Celebration Preview Component. Why: The user should be able to actually watch each celebration style before committing to it. How: This plays celStyStr, replaying every time celTokNum bumps. */ }


							</CarSurCom>


						</div>

						<div className='set-subsection set-subsection--pickanim'>{ /* What: Pickanim Subsection Div Element. Why: The picker-animation style picker needs its own labeled subsection. How: This wraps its own heading, intro copy, reduced-motion note, and the style picker plus preview CarSurCom. */ }


							<div className='set-subsection-h'>Picker animation</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Picker animation". */ }

							<p className='settings-sub'>Pick which animation will play when the &ldquo;Pick One&rdquo; button is clicked inside of the Pickers page.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the picker-animation picker. */ }


							{ motNotFun( 'this animation' ) /* What: Reduced Motion Note Call. Why: A user who prefers reduced motion needs to know this animation won't play on its own, only on demand here. How: This renders motNotFun's own note, naming "this animation", or nothing while redMotBoo is false. */ }
							<CarSurCom
								padded={ false }
								className='style-radio-card'
							>{ /* What: Card Surface Component. Why: The style picker and its live preview stage need a shared, unpadded bordered container. How: This wraps StyRadCom and PicAniCom together. */ }


								<StyRadCom
									groupName='pickAnim'
									groupLabel='Picker animation'
									value={ ( state.appearance && state.appearance.pickAnim ) || 'reel' }
									options={ [


										{ value : 'reel',       label : 'Reel',       hint : 'Candidates cycle past like a slot-machine reel before landing on the pick.' },
										{ value : 'spotlight',  label : 'Spotlight',  hint : 'A spotlight sweeps across the candidates and settles on the pick.' },
										{ value : 'dissolve',   label : 'Dissolve',   hint : 'Candidates crossfade in place, dissolving into the final pick.' }


									] }
									previewDisabled={ false }
									onChange={ ( newValStr ) => { setPicPreStr( null ); actions.setPickAnim( newValStr ); } }
									onPreview={ plyPicFun }
								/>{ /* What: Style Radio Component. Why: This is the actual picker-animation style picker. How: This is bound to the persisted pickAnim, saving via actions.setPickAnim (clearing any stale preview first) and previewing via plyPicFun. */ }

								<PicAniCom
									styKeyStr={ picPreStr || ( state.appearance && state.appearance.pickAnim ) || 'reel' }
									repTokNum={ picTokNum }
								/>{ /* What: Picker Animation Component. Why: The user should be able to actually watch each picker-animation style before committing to it. How: This plays picPreStr while a preview is active, otherwise the selected pickAnim, replaying every time picTokNum bumps. */ }


							</CarSurCom>


						</div>

						<div className='set-subsection set-subsection--layout'>{ /* What: Layout Subsection Div Element. Why: The tab-bar-placement control needs its own labeled subsection. How: This wraps its own heading, intro copy, and the placement row's own CarSurCom. */ }


							<div className='set-subsection-h'>Layout</div>{ /* What: Set Subsection H Div Element. Why: Every Appearance subsection names itself with this same heading style. How: This renders the fixed text "Layout". */ }

							<p className='settings-sub'>Pick where the app&rsquo;s main navigation links should be located.</p>{ /* What: Settings Sub Paragraph Element. Why: This subsection needs its own short intro line beneath its heading. How: This renders the fixed intro copy for the placement control. */ }


							<CarSurCom>{ /* What: Card Surface Component. Why: The placement row needs the same bordered container as every other row in this tab. How: This wraps the placement row below. */ }


								<div className='set-data-row'>{ /* What: Layout Row Div Element. Why: The label/description and the SegConCom control need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the SegConCom control. */ }


									<div className='set-data-info'>{ /* What: Layout Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the control. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Tab bar placement</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Tab bar placement". */ }

										<span
											className='set-data-sub set-sub-fade set-layout-sub'
											key={ ( state.appearance && state.appearance.tabPlacement ) || 'bottom' }
										>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the selected placement, and should fade between versions. How: This remounts (via its own placement key) and renders whichever of 3 explanatory sentences matches the current placement. */ }


											{ ( ( state.appearance && state.appearance.tabPlacement ) || 'bottom' ) === 'bottom'


												? <>The main navigation is now a floating bar towards the <strong>bottom of the screen</strong>.</>
												: ( ( state.appearance && state.appearance.tabPlacement ) === 'side' )
												? <>The main navigation is now a sidebar on the <strong>left side of the screen</strong>.</>
												: <>The main navigation is now a bar at the <strong>top of the screen</strong>.</> }


										</span>


									</div>

									<SegConCom
										optIteArr={ [


											{ keyStr : 'bottom', labStr : 'Bottom' }, // What: Key String. Why: This is the tab bar's own default placement. How: SegConCom compares this against the current tabPlacement and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: SegConCom renders this as the button's own text content.
											{ keyStr : 'side',   labStr : 'Side' },   // What: Key String. Why: This puts the tab bar in a vertical rail instead. How: SegConCom compares this against the current tabPlacement and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: SegConCom renders this as the button's own text content.
											{ keyStr : 'top',    labStr : 'Top' }     // What: Key String. Why: This puts the tab bar above the page content instead. How: SegConCom compares this against the current tabPlacement and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: SegConCom renders this as the button's own text content.


										] }
										value={ ( state.appearance && state.appearance.tabPlacement ) || 'bottom' }
										ariLabStr='Tab bar placement'
										onChange={ actions.setTabPlacement }
									/>{ /* What: Segment Control Component. Why: This is the actual 3-way exclusive control for the tab-bar placement. How: This is bound to the persisted tabPlacement, saving via actions.setTabPlacement. */ }


								</div>


							</CarSurCom>


						</div>


					</section>

					{ /* ── Daily generator ───────────────────────────────────────────── */ }
					<section
						className='set-section set-section--daily'
						ref={ ( secCurEle ) => { secMapRef.current[ 'daily' ] = secCurEle; } }
					>{ /* What: Daily Section Element. Why: This is the Daily generator section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the generator's own settings CarSurCom. */ }


						<div className='set-section-h'><span className='kicker'>Daily generator</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Daily generator" inside the shared kicker span. */ }

						<p className='settings-sub'>The Daily generator can always be run manually from the Today page regardless of this setting. Which pickers are included in the Daily generator can be found with their own settings in the Data page.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for the Daily generator. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: The auto-run toggle, its run-time row, and the notify-me row all share one bordered container. How: This wraps all 3 rows below. */ }


							<div className='set-data-row'>{ /* What: Auto Run Row Div Element. Why: The label/description and the switch need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the switch button. */ }


								<div className='set-data-info'>{ /* What: Auto Run Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the switch. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Run automatically</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Run automatically". */ }

									<span
										className='set-data-sub set-sub-fade'
										key={ dlyModStr + ( state.daily && state.daily.runTime ) }
									>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the mode and run time, and should fade between versions. How: This remounts (via its own mode+time key) and renders one of 2 explanatory sentences depending on dlyModStr. */ }


										{ dlyModStr === 'auto'


											? <>Daily generator will run automatically every day at <strong>{ forRunFun( ( state.daily && state.daily.runTime ) || '04:00' ) }</strong>.</>
											: <>Daily generator can only be run <strong>manually</strong> via the generator button at the bottom of the Today page.</> }


									</span>


								</div>

								<button
									className={ ` switch   ${ dlyModStr === 'auto' ? 'is-on' : '' } ` }
									aria-pressed={ dlyModStr === 'auto' }
									aria-label='Run the Daily generator automatically'
									onClick={ () => actions.setDailyMode( dlyModStr === 'auto' ? 'manual' : 'auto' ) }
								><i /></button>{ /* What: Auto Run Switch Button Element. Why: This is the actual control that flips between automatic and manual generator runs. How: This calls actions.setDailyMode with the toggled value when clicked. */ }


							</div>

							<div className={ ` set-data-row   set-data-row--sub   ${ dlyModStr === 'auto' ? '' : 'is-disabled' } ` }>{ /* What: Run Time Row Div Element. Why: The run-time input is only meaningful while auto mode is on, so this whole row visually disables itself otherwise. How: This wraps the info block and the time input. */ }


								<div className='set-data-info'>{ /* What: Run Time Info Div Element. Why: The row's own name and its live-updating description need their own grouping, apart from the input. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Run automatically at</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Run automatically at". */ }

									<span
										className='set-data-sub set-sub-fade'
										key={ dlyModStr }
									>{ /* What: Set Data Sub Span Element. Why: This row's own description changes meaning based on the mode, and should fade between versions. How: This remounts (via its own mode key) and renders one of 2 explanatory sentences depending on dlyModStr. */ }


										{ dlyModStr === 'auto'


											? 'A quiet, early hour works best so that your list is ready for you first thing in the morning.'
											: 'Auto generation is turned off, turn it on to modify this setting.' }


									</span>


								</div>

								<input
									type='time'
									className='np-input set-time-input'
									value={ ( state.daily && state.daily.runTime ) || '04:00' }
									disabled={ dlyModStr !== 'auto' }
									aria-label='Daily generator run time'
									onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); } }
									onChange={ ( chaEveObj ) => onRunChaFun( chaEveObj.target.value ) }
								/>{ /* What: Run Time Input Element. Why: This is the actual control for the generator's own scheduled run time. How: This is bound to the persisted runTime, saving (and asking notification permission once) via onRunChaFun. */ }


							</div>

							{ dlyModStr === 'auto' && notPerStr !== 'unsupported' && ( // What: Notify Row Visibility Check. Why: The notify-me row only makes sense while the generator actually runs automatically, and only in an environment that supports notifications at all. How: This renders the whole row only while both conditions hold.


								<div className='set-data-row set-notify-row'>{ /* What: Notify Row Div Element. Why: The label/description and the permission control need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and whichever of the 3 permission-state controls below applies. */ }


									<div className='set-data-info'>{ /* What: Notify Info Div Element. Why: The row's own name and its permission-dependent description need their own grouping, apart from the control. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Notify me when it runs</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Notify me when it runs". */ }

										<span className='set-data-sub'>{ /* What: Set Data Sub Span Element. Why: This row's own description depends on the real current notification permission. How: This renders one of 3 explanatory sentences depending on notPerStr. */ }


											{ notPerStr === 'granted'


												? <>You&rsquo;ll get a notification once your list has been generated but only while the app is open in a tab or window. Notifications for a closed app are coming in a future release.</>
												: notPerStr === 'denied'
												? <>Notifications are blocked for this site. You&rsquo;ll need to allow them in your browser&rsquo;s site settings.</>
												: <>Get a nudge once your list has been generated. Only works while the app is open in a tab or window.</> }


										</span>


									</div>

									{ notPerStr === 'default' && ( // What: Enable Button Check. Why: An Enable button only makes sense while permission has not yet been decided either way. How: This renders the ButBasCom only while notPerStr is 'default'.


										<ButBasCom
											kind='secondary'
											size='sm'
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

					{ /* ── Holidays ──────────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--holidays'
						ref={ ( secCurEle ) => { secMapRef.current[ 'holidays' ] = secCurEle; } }
					>{ /* What: Holidays Section Element. Why: This is the Holidays section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and HolEdiCom's own CarSurCom. */ }


						<div className='set-section-h'><span className='kicker'>Holidays</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Holidays" inside the shared kicker span. */ }

						<p className='settings-sub'>Any pickers that are set to &ldquo;Skip on holidays&rdquo; will not be run on the days that are toggled on here. Toggle off any that you don&rsquo;t observe, or even add your own! Dates shown are for { new Date().getFullYear() }.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Holidays, inlining the real current year. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: The whole holiday list and its add-form need a shared bordered container. How: This wraps HolEdiCom. */ }


							<HolEdiCom
								state={ state }
								actions={ actions }
							/>{ /* What: Holiday Editor Component. Why: The holiday list and its add-form are substantial enough to live in their own component. How: This renders it, driven by the same shared state/actions this whole tab receives. */ }


						</CarSurCom>


					</section>

					{ /* ── Data control ──────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--data'
						ref={ ( secCurEle ) => { secMapRef.current[ 'data' ] = secCurEle; } }
					>{ /* What: Data Section Element. Why: This is the Data control section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the whole storage/export/import/reset CarSurCom. */ }


						<div className='set-section-h'><span className='kicker'>Data control</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Data control" inside the shared kicker span. */ }

						<p className='settings-sub'>All of your data is stored locally, on this device to do with it as you will. Unfortunately, this also means that if you want to use this app on a different device then you will need to export your data here, and then use the import feature on the other device. Exporting your data is also a good way to backup your data, just in case something were to happen either to your device or to the browser and its stored data.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Data control. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: The storage-status row, the platform-specific install notes, and the export/import/reset rows all share one bordered container. How: This wraps every row below. */ }


							<div className='set-data-row set-store-row'>{ /* What: Store Row Div Element. Why: The storage-status label/facts and the install/protect actions need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the store-actions block. */ }


								<div className='set-data-info'>{ /* What: Store Info Div Element. Why: The row's own name, description, fact chips, and any persist-result message all need their own grouping. How: This wraps the name span, the description span, the facts span, and (conditionally) the persist-message span. */ }


									<span className='set-data-name'>Where your data lives</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Where your data lives". */ }

									<span className='set-data-sub'>{ /* What: Set Data Sub Span Element. Why: This row's own description depends on which storage engine is actually in use. How: This renders one of 2 explanatory sentences depending on stoStaObj's own engine field. */ }


										{ stoStaObj && stoStaObj.engine === 'idb'


											? <>Stored in this browser&rsquo;s database on this device.</>
											: <>Stored in this browser&rsquo;s simple storage on this device &mdash; more likely to be cleared automatically. Exporting a backup is worth doing.</> }


									</span>


									<span className='set-store-facts'>{ /* What: Store Facts Span Element. Why: The protected/size/mirror facts, plus an install confirmation, need their own grouping as a row of small chips. How: This wraps 3 always-shown chips plus an installed chip while isaStaBoo is true. */ }


										<span className={ ` set-store-chip   ${ stoStaObj && stoStaObj.persisted ? 'is-ok' : 'is-warn' } ` }>{ stoStaObj && stoStaObj.persisted ? 'Protected from cleanup' : 'Not protected yet' }</span>{ /* What: Persisted Chip Span Element. Why: Whether the browser has promised not to evict this app's own data is worth its own always-visible chip. How: This renders one of 2 labels, styled ok/warn, based on stoStaObj's own persisted field. */ }

										<span className='set-store-chip'>{ forBytFun( stoStaObj && stoStaObj.dataBytes ) } of your data</span>{ /* What: Size Chip Span Element. Why: How much data is actually stored is worth its own always-visible chip. How: This renders forBytFun's own formatted size, reading stoStaObj's own dataBytes field. */ }

										<span className={ ` set-store-chip   ${ stoStaObj && stoStaObj.mirrorOk === false ? 'is-warn' : '' } ` }>Fallback copy: { stoStaObj && stoStaObj.mirrorOk === false ? 'out of date' : forWhnFun( stoStaObj && stoStaObj.mirrorAt ) }</span>{ /* What: Mirror Chip Span Element. Why: How fresh the localStorage fallback mirror is worth its own always-visible chip. How: This renders either a warning or forWhnFun's own formatted timestamp, reading stoStaObj's own mirrorOk/mirrorAt fields. */ }

										{ isaStaBoo && <span className='set-store-chip is-ok'>Installed</span> /* What: Installed Chip Check. Why: An installed/standalone app deserves its own small confirmation chip alongside the others. How: This renders the chip only while isaStaBoo is true. */ }


									</span>

									{ perMesObj && ( // What: Persist Message Check. Why: A message should only exist right after an actual Install/Protect Data attempt. How: This renders the message span only while perMesObj holds a value.


										<span
											className={ ` set-import-msg   ${ perMesObj.ok ? 'is-ok' : 'is-err' } ` }
											role='status'
										>{ perMesObj.text }</span> // What: Persist Message Span Element. Why: This is the actual outcome text from the last Install/Protect Data attempt. How: This renders perMesObj's own text field, styled ok/err based on its own ok field.


									) }


								</div>

								<div className='set-store-actions'>{ /* What: Store Actions Div Element. Why: The Install and Protect Data buttons need their own grouping, apart from the info block. How: This conditionally renders whichever of the 3 buttons currently applies. */ }


									{ canInsBoo && ( // What: Install Button Check. Why: An Install button should only ever show while a real install prompt is actually available. How: This renders the ButBasCom only while canInsBoo is true.


										<ButBasCom
											kind='primary'
											size='sm'
											icon='download'
											className='set-install-btn'
											onClick={ onInsFun }
										>Install app</ButBasCom> // What: Button Base Component. Why: This is the actual trigger for the native install prompt. How: This calls onInsFun when clicked.


									) }

									{ insStaStr === 'pending' && ( // What: Pending Install Button Check. Why: While it is not yet known whether an install prompt will become available, a disabled placeholder avoids a layout jump. How: This renders a disabled ButBasCom only while insStaStr is 'pending'.


										<ButBasCom
											kind='secondary'
											size='sm'
											icon='download'
											disabled
										>Install app</ButBasCom> // What: Button Base Component. Why: This is a disabled placeholder shown only until install support is actually known one way or the other. How: This renders with no onClick at all, since it is always disabled.


									) }

									{ !( stoStaObj && stoStaObj.persisted ) && ( // What: Protect Data Button Check. Why: The Protect Data button only makes sense while persistence has not already been granted. How: This renders the ButBasCom only while stoStaObj reports persisted as falsy (or is not yet loaded).


										<ButBasCom
											kind='secondary'
											size='sm'
											className='set-protect-btn'
											onClick={ onPerFun }
										>Protect Data</ButBasCom> // What: Button Base Component. Why: This is the actual trigger for the storage-persistence request. How: This calls onPerFun when clicked.


									) }


								</div>


							</div>

							{ insStaStr === 'installed' && ( // What: Already Installed Note Check. Why: A user viewing this in a plain browser tab, while an installed copy already exists, should be pointed at that installed copy instead. How: This renders the note only while insStaStr is 'installed'.


								<div className='set-data-row set-store-ios'>{ /* What: Already Installed Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. */ }


									<div className='set-data-info'>{ /* What: Already Installed Info Div Element. Why: The note's own name and explanation need their own grouping. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Already installed on this device</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Already installed on this device". */ }

										<span className='set-data-sub'>You&rsquo;re viewing Ease My Life in a browser tab. Open the installed app from your home screen or app list instead. It&rsquo;s the same data, and the installed copy is the one protected from browser cleanup.</span>{ /* What: Set Data Sub Span Element. Why: The user needs a clear, actionable explanation of why they are seeing this note. How: This renders the fixed explanatory copy. */ }


									</div>


								</div>


							) }

							{ insStaStr === 'unsupported' && !iosInsBoo && !macInsBoo && ( // What: Unsupported Note Check. Why: A browser with no install prompt and no iOS/macOS-specific instructions still deserves guidance. How: This renders the note only while all 3 conditions hold.


								<div className='set-data-row set-store-ios'>{ /* What: Unsupported Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. */ }


									<div className='set-data-info'>{ /* What: Unsupported Info Div Element. Why: The note's own name and explanation need their own grouping. How: This wraps the name span and the description span. */ }


										<span className='set-data-name'>Installing from this page isn&rsquo;t available here</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Installing from this page isn't available here". */ }

										<span className='set-data-sub'>Some browsers offer <strong>Install app</strong> or <strong>Add to Home screen</strong> in their own menu, so it&rsquo;s worth a look. Others, including Firefox on desktop, can&rsquo;t install web apps at all. There you&rsquo;d need a Chromium based browser such as Chrome or Edge. Either way you can keep using Ease My Life right here, just use the <strong>Protect Data</strong> control above to make this browser far less likely to clear it.</span>{ /* What: Set Data Sub Span Element. Why: The user needs a clear explanation of why no install option is showing, plus the next-best alternative. How: This renders the fixed explanatory copy. */ }


									</div>


								</div>


							) }

							{ iosInsBoo && ( // What: Ios Install Note Check. Why: iOS/iPadOS need their own distinct install instructions and data-migration warning. How: This renders the note only while iosInsBoo is true.


								<div className='set-data-row set-store-ios'>{ /* What: Ios Install Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. */ }


									<div className='set-data-info'>{ /* What: Ios Install Info Div Element. Why: The note's own name and its 2 explanatory paragraphs need their own grouping. How: This wraps the name span and 2 description spans. */ }


										<span className='set-data-name'>Add to your Home Screen</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Add to your Home Screen". */ }

										<span className='set-data-sub'>On iPhone and iPad, tap <strong>Share</strong> then <strong>Add to Home Screen</strong>. Do this and Safari stops clearing your data when the app sits unused. Without it, everything here can be wiped after a period of not opening the app.</span>{ /* What: Set Data Sub Span Element. Why: The user needs the actual step-by-step instructions for this platform. How: This renders the fixed instructional copy. */ }

										<span className='set-data-sub'><strong>WARNING:</strong> iOS and iPadOS do not copy over your existing data when installing the app. Please use the Export feature below to export your data and then import your data back in using the Import feature.</span>{ /* What: Set Data Sub Span Element. Why: This platform's own install flow does not carry over existing data, and that is a genuinely destructive surprise worth its own separate warning. How: This renders the fixed warning copy. */ }


									</div>


								</div>


							) }

							{ macInsBoo && ( // What: Mac Install Note Check. Why: macOS Safari needs its own distinct install instructions and data-migration warning. How: This renders the note only while macInsBoo is true.


								<div className='set-data-row set-store-ios'>{ /* What: Mac Install Row Div Element. Why: This platform-specific note needs the same info-row shape as every other row here, minus any action. How: This wraps just the info block, with no action beside it. */ }


									<div className='set-data-info'>{ /* What: Mac Install Info Div Element. Why: The note's own name and its 2 explanatory paragraphs need their own grouping. How: This wraps the name span and 2 description spans. */ }


										<span className='set-data-name'>Add to your Dock</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Add to your Dock". */ }

										<span className='set-data-sub'>On Mac, open Safari&rsquo;s <strong>File</strong> menu and choose <strong>Add to Dock</strong>. Do this and Safari stops clearing your data when the app sits unused. Without it, everything here can be wiped after a period of not opening the app.</span>{ /* What: Set Data Sub Span Element. Why: The user needs the actual step-by-step instructions for this platform. How: This renders the fixed instructional copy. */ }

										<span className='set-data-sub'><strong>WARNING:</strong> macOS does not copy over your existing data when installing the app. Please use the Export feature below to export your data and then import your data back in using the Import feature.</span>{ /* What: Set Data Sub Span Element. Why: This platform's own install flow does not carry over existing data, and that is a genuinely destructive surprise worth its own separate warning. How: This renders the fixed warning copy. */ }


									</div>


								</div>


							) }

							<div className='set-data-row set-export-row'>{ /* What: Export Row Div Element. Why: The export label/description and the Export button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Export control. */ }


								<div className='set-data-info'>{ /* What: Export Info Div Element. Why: The row's own name, description, and any post-export message all need their own grouping. How: This wraps the name span, the description span, and (conditionally) the export-message span. */ }


									<span className='set-data-name'>Export a backup</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Export a backup". */ }

									<span className='set-data-sub'>Downloads a JSON file of everything, this includes <strong>{ picCouNum }</strong> pickers, <strong>{ iteCouNum }</strong> items, <strong>{ remCouNum }</strong> reminders and <strong>all app settings</strong>.</span>{ /* What: Set Data Sub Span Element. Why: The row's own description should say exactly what a backup would include right now. How: This renders the fixed description, inlining the live picCouNum/iteCouNum/remCouNum counts. */ }


									{ expMesObj && ( // What: Export Message Check. Why: A message should only exist right after an actual export just happened. How: This renders the message span only while expMesObj holds a value.


										<span
											className='set-import-msg is-ok'
											key={ expMesObj.t }
										>Backup exported &mdash; including <strong>{ expMesObj.entries }</strong> history { expMesObj.entries === 1 ? 'entry' : 'entries' }.</span> // What: Export Message Span Element. Why: This is the actual confirmation text from the last export. How: This renders expMesObj's own entries count, pluralized correctly for exactly 1 entry.


									) }


								</div>

								{ hasDatBoo


									? ( <ButBasCom kind='secondary' size='sm' icon='download' ref={ expButRef } onClick={ expDatFun }>Export</ButBasCom> ) // What: Button Base Component. Why: This is the actual trigger for building and downloading the backup. How: This calls expDatFun when clicked.
									: ( <InfTipCom className='set-disabled-btn' label='There is no user data to export.'><ButBasCom kind='secondary' size='sm' icon='download' disabled>Export</ButBasCom></InfTipCom> ) /* What: Info Tip Component. Why: A disabled Export button still needs to explain, on hover/focus, exactly why it is disabled. How: This wraps a disabled ButBasCom, shown only while hasDatBoo is false. */ }


							</div>

							<div className='set-data-row set-import-row'>{ /* What: Import Row Div Element. Why: The import label/description and the Import control (or its confirm pair) need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block, the hidden file input, and whichever of the trigger/confirm controls currently applies. */ }


								<div className='set-data-info'>{ /* What: Import Info Div Element. Why: The row's own name, description, and any pending/completed message all need their own grouping. How: This wraps the name span, the description span, and whichever message span currently applies. */ }


									<span className='set-data-name'>Import a backup</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Import a backup". */ }

									<span className='set-data-sub'><strong>Replaces all data</strong> that is currently being stored by this app with a previously exported file.</span>{ /* What: Set Data Sub Span Element. Why: The destructive nature of import needs to be stated plainly up front. How: This renders the fixed description. */ }


									{ penImpObj && ( // What: Pending Import Message Check. Why: A confirmation prompt should only exist while a backup is actually staged and awaiting confirmation. How: This renders the message span only while penImpObj holds a value.


										<span
											className='set-import-msg is-warn'
											id='set-import-confirm-msg'
										>Import <strong>{ penImpObj.name }</strong>? This <strong>replaces all data</strong> currently stored by this app.</span> // What: Pending Import Message Span Element. Why: This is the actual confirmation prompt, naming the staged file. How: This renders penImpObj's own name, and is referenced by the confirm button's own aria-describedby below.


									) }

									{ !penImpObj && impMesObj && ( // What: Import Outcome Message Check. Why: A completed (or failed) message should only show once no confirmation is currently pending. How: This renders the message span only while both conditions hold.


										<span className={ ` set-import-msg   ${ impMesObj.ok ? 'is-ok' : 'is-err' } ` }>{ impMesObj.text }</span> // What: Import Outcome Message Span Element. Why: This is the actual outcome text from the last import attempt. How: This renders impMesObj's own text, styled ok/err based on its own ok field.


									) }


								</div>

								<input
									ref={ filInpRef }
									type='file'
									accept='application/json,.json'
									aria-label='Import a backup file'
									style={{ display : 'none' }}
									onChange={ onImpFun }
								/>{ /* What: File Input Element. Why: A real, native file picker is required to choose a backup file; it stays hidden since the Import ButBasCom below is what the user actually sees. How: This is triggered indirectly via filInpRef.current.click() and handled by onImpFun. */ }

								{ penImpObj ? ( // What: Pending Import Check. Why: A staged backup awaiting confirmation replaces the plain Import trigger with its own confirm pair. How: This renders the confirm pair while penImpObj holds a value, the plain trigger otherwise.


									<div className={ ` set-reset-confirm   ${ impLeaBoo ? 'is-leaving' : '' } ` }>{ /* What: Import Confirm Div Element. Why: The Import/Cancel confirm pair needs its own grouping, replacing the single Import trigger while a backup is staged. How: This wraps the confirm's own Import and Cancel buttons. */ }


										<ButBasCom
											kind='danger'
											size='sm'
											ref={ impConRef }
											aria-describedby='set-import-confirm-msg'
											onClick={ doImpFun }
										>Import</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final confirmation that replaces all data with the staged backup. How: This calls doImpFun when clicked. */ }

										<ButBasCom
											kind='ghost'
											size='sm'
											onClick={ cnlImpFun }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The confirmation needs an explicit way to back out without importing. How: This calls cnlImpFun when clicked. */ }


									</div>


								) : ( // What: Plain Import Branch. Why: With nothing staged yet, the row just needs its normal clickable trigger. How: This renders the else branch, taken while penImpObj is null.


									<ButBasCom
										kind='secondary'
										size='sm'
										icon='upload'
										ref={ impButRef }
										onClick={ () => filInpRef.current && filInpRef.current.click() }
									>Import</ButBasCom> // What: Button Base Component. Why: This is the actual trigger that opens the native file picker. How: This calls the hidden file input's own click() when clicked.


								) }


							</div>

							<div className='set-data-row set-data-row--danger set-reset-row'>{ /* What: Reset Row Div Element. Why: The reset label/description and the Reset control (or its confirm pair) need to sit in the tab's usual info-plus-action row layout, flagged as a dangerous action. How: This wraps the info block and whichever of the trigger/confirm/disabled controls currently applies. */ }


								<div className='set-data-info'>{ /* What: Reset Info Div Element. Why: The row's own name, description, and any post-reset message all need their own grouping. How: This wraps the name span, the description span, and (conditionally) the reset-message span. */ }


									<span className='set-data-name'>Reset all data</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Reset all data". */ }

									<span
										className='set-data-sub'
										id='set-reset-confirm-msg'
									>Wipes everything and restores the app to a clean state. <strong>This can&rsquo;t be undone.</strong></span>{ /* What: Set Data Sub Span Element. Why: The destructive and irreversible nature of reset needs to be stated plainly up front, and is also referenced by the confirm button's own aria-describedby below. How: This renders the fixed description. */ }


									{ resMesStr && ( // What: Reset Message Check. Why: A message should only exist right after an actual reset just happened. How: This renders the message span only while resMesStr holds a value.


										<span
											className='set-import-msg is-ok'
											role='status'
											key={ resMesStr }
										>{ resMesStr }</span> // What: Reset Message Span Element. Why: This is the actual confirmation text from the last reset. How: This renders resMesStr directly.


									) }


								</div>

								{ conResBoo ? ( // What: Reset Confirm Check. Why: An in-progress reset confirmation replaces the trigger with its own Reset/Cancel pair. How: This renders the confirm pair while conResBoo is true.


									<div className={ ` set-reset-confirm   ${ resLeaBoo ? 'is-leaving' : '' } ` }>{ /* What: Reset Confirm Div Element. Why: The Reset/Cancel confirm pair needs its own grouping, replacing the single Reset trigger while confirmation is pending. How: This wraps the confirm's own Reset and Cancel buttons. */ }


										<ButBasCom
											kind='danger'
											size='sm'
											ref={ resConRef }
											aria-describedby='set-reset-confirm-msg'
											onClick={ () => {


												// Land on Today FIRST: the clean state re-opens the welcome
												// modal, and its tour anchors only exist on the Today tab.
												// Starting the tour from Settings left it dimmed with no
												// coach.
												if ( onHomFun ) onHomFun(); // What: Navigate Home Call. Why: The post-reset welcome modal's own tour anchors only exist on the Today tab. How: This calls onHomFun, if provided, before the reset itself actually runs.

												actions.reset(); setConResBoo( false ); setResLeaBoo( false ); setResMesStr( 'All data reset.' ); // What: Reset And Close Call. Why: This is the actual store mutation, alongside closing the confirm and reporting the outcome. How: This calls actions.reset(), then clears the confirm/leaving flags and sets resMesStr.

												// Nothing here to return focus to (the row's own Reset button
												// becomes disabled with no data), and the welcome modal takes
												// focus on the Today tab, so just say what happened.
												annStaFun( 'All data reset.' ); // What: Reset Announce Call. Why: A screen-reader user needs to hear the reset happened too, especially since no focus target remains here to imply it visually. How: This announces a fixed confirmation message.


											}}
										>Reset</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final confirmation that wipes all data. How: This navigates home, resets the store, closes the confirm, and announces the outcome when clicked. */ }

										<ButBasCom
											kind='ghost'
											size='sm'
											onClick={ cloResFun }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The confirmation needs an explicit way to back out without resetting. How: This calls cloResFun when clicked. */ }


									</div>


								) : hasDatBoo ? ( // What: Has Data Check. Why: A working Reset trigger only makes sense while there's actually something to reset. How: This renders the working Reset button while hasDatBoo is true, an explained disabled one otherwise.


									<ButBasCom
										kind='danger'
										size='sm'
										icon='refresh'
										ref={ resButRef }
										onClick={ () => { setResMesStr( null ); setConResBoo( true ); } }
									>Reset</ButBasCom> // What: Button Base Component. Why: This is the actual trigger that opens the reset confirmation. How: This clears any stale message and opens the confirm pair when clicked.


								) : ( // What: No Data Branch. Why: With no data at all, the Reset trigger needs to explain why it's disabled instead of silently doing nothing. How: This renders the else branch, taken while hasDatBoo is false.


									<InfTipCom
										className='set-disabled-btn'
										label='There is no user data to reset.'
									><ButBasCom kind='danger' size='sm' icon='refresh' disabled>Reset</ButBasCom></InfTipCom> // What: Info Tip Component. Why: A disabled Reset button still needs to explain, on hover/focus, exactly why it is disabled. How: This wraps a disabled ButBasCom, shown only while there is no data and no confirm pending.


								) }


							</div>


						</CarSurCom>


					</section>

					{ /* ── Account ───────────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--account'
						ref={ ( secCurEle ) => { secMapRef.current[ 'account' ] = secCurEle; } }
					>{ /* What: Account Section Element. Why: This is the Account section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the sync-placeholder CarSurCom. */ }


						<div className='set-section-h'><span className='kicker'>Account</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Account" inside the shared kicker span. */ }

						<p className='settings-sub'>Ease My Life runs entirely on this device, with no account required. Sign in to sync across devices is planned for a future release as a paid feature (one time fee only).</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Account. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: The sync-placeholder row needs the same bordered container as every other row in this tab. How: This wraps the sync row below. */ }


							<div className='set-data-row'>{ /* What: Sync Row Div Element. Why: The label/description and the disabled placeholder button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the disabled ButBasCom. */ }


								<div className='set-data-info'>{ /* What: Sync Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Sync across devices</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Sync across devices". */ }

									<span className='set-data-sub'>This feature will keep all of your Ease My Life data synced across every device that you sign in to.</span>{ /* What: Set Data Sub Span Element. Why: The row needs to explain what this not-yet-shipped feature will actually do. How: This renders the fixed description. */ }


								</div>

								<ButBasCom
									kind='secondary'
									size='sm'
									disabled
								>Coming Soon</ButBasCom>{ /* What: Button Base Component. Why: A disabled placeholder communicates the feature exists without implying it works today. How: This renders with no onClick at all, since it is always disabled. */ }


							</div>


						</CarSurCom>


					</section>

					{ /* ── About ─────────────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--about'
						ref={ ( secCurEle ) => { secMapRef.current[ 'about' ] = secCurEle; } }
					>{ /* What: About Section Element. Why: This is the About section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy plus 4 Cards: the app identity, the support-the-project row, the replay-tour row, and ConSupCom. */ }


						<div className='set-section-h'><span className='kicker'>About</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "About" inside the shared kicker span. */ }

						<p className='settings-sub'>Ease My Life is a labor of love for me. I have been using a version of this app on my own home server for years, and I have always wanted to turn it into a &ldquo;proper app&rdquo; that I could share with everyone else. I hope there are at least a few people out there that find it as useful as I do. You can find out more information about myself by visiting the link below to my personal website, including links to some of my other projects.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading, and About's own is a longer personal note. How: This renders the fixed first paragraph. */ }

						<p className='settings-sub'>You will also find the link to this app&rsquo;s source code on GitHub. This is an open source project with an &ldquo;MIT + Non-Commercial&rdquo; Custom License which will allow anyone to freely fork and modify the project&rsquo;s source code, provided that attribution is included in your project and that you will not be selling the software or making money off it in any way. Please be responsible with the source code, because I am just one person maintaining the project in their free time trying to make a living. This is not some big company with vast resources trying to extract every dollar that they can.</p>{ /* What: Settings Sub Paragraph Element. Why: The license terms deserve their own separate paragraph from the personal note above. How: This renders the fixed second paragraph. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: The app's own name, version, and creator/GitHub links need a shared bordered container. How: This wraps the set-about div below. */ }


							<div className='set-about'>{ /* What: Set About Div Element. Why: The brand name, version, and links all belong to one identity block. How: This wraps the brand span and the version/creator/GitHub spans. */ }


								<div className='set-about-brand'>{ /* What: Set About Brand Div Element. Why: The brand name needs its own small wrapper, separate from the version/link lines below it. How: This wraps the single brand-name span. */ }


									<span className='set-about-name'>Ease My Life</span>{ /* What: Set About Name Span Element. Why: The identity block needs its own visible app name. How: This renders the fixed text "Ease My Life". */ }


								</div>

								<span className='set-about-ver'>{ APP_VER_STR == null ? 'Version: 1.0' : `Version: ${ APP_VER_STR }` }</span>{ /* What: Set About Ver Span Element. Why: The real build version belongs in this identity block. How: This renders APP_VER_STR, falling back to "1.0" when the build-time define is missing. */ }

								<span className='set-about-creator'>Creator: <a href='https://techgeek.support/' target='_blank' rel='noopener noreferrer'>https://techgeek.support/</a></span>{ /* What: Set About Creator Span Element. Why: The identity block links to the creator's own personal site. How: This renders a fixed external link, opened in a new tab. */ }

								<span className='set-about-creator'>GitHub: <a href='https://github.com/z4nta0/ease-my-life' target='_blank' rel='noopener noreferrer'>https://github.com/z4nta0/ease-my-life</a></span>{ /* What: Set About Creator Span Element. Why: The identity block also links to the project's own source code. How: This renders a fixed external link, opened in a new tab. */ }


							</div>


						</CarSurCom>

						<CarSurCom>{ /* What: Card Surface Component. Why: The "support the project" row needs the same bordered container as every other row in this tab. How: This wraps the support-project row below. */ }


							<div className='set-data-row set-support-project-row'>{ /* What: Support Project Row Div Element. Why: The label/description and the disabled placeholder button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the disabled ButBasCom. */ }


								<div className='set-data-info'>{ /* What: Support Project Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Support the project</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Support the project". */ }

									<span className='set-data-sub'>Enjoying Ease My Life? Consider buying me a coffee.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short, friendly ask. How: This renders the fixed description. */ }


								</div>

								<ButBasCom
									kind='secondary'
									size='sm'
									disabled
								>Buy Me a Coffee</ButBasCom>{ /* What: Button Base Component. Why: A disabled placeholder communicates the feature exists without implying it works today. How: This renders with no onClick at all, since it is always disabled. */ }


							</div>


						</CarSurCom>

						<CarSurCom>{ /* What: Card Surface Component. Why: The "replay the welcome tour" row needs the same bordered container as every other row in this tab. How: This wraps the replay-tour row below. */ }


							<div className='set-data-row set-replay-tour-row'>{ /* What: Replay Tour Row Div Element. Why: The label/description and the Replay Tour button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Replay Tour ButBasCom. */ }


								<div className='set-data-info'>{ /* What: Replay Tour Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Replay the welcome tour</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Replay the welcome tour". */ }

									<span className='set-data-sub'>Runs the first-run walkthrough again. Including the welcome message, a guided tour of pickers, generating your day, and reminders.</span>{ /* What: Set Data Sub Span Element. Why: The row needs to explain what pressing this button actually does. How: This renders the fixed description. */ }


								</div>

								<ButBasCom
									kind='secondary'
									size='sm'
									icon='refresh'
									onClick={ () => {


										if ( onHomFun ) onHomFun(); // What: Navigate Home Call. Why: The Welcome Tour's own anchors only exist on the Today tab. How: This calls onHomFun, if provided, before touching any onboarding flags below.

										// Self-healing for accounts whose checklistDone got permanently
										// stuck false by a since-fixed migrate() gap (real, established
										// accounts that updated through an old version boundary before
										// that field existed; see migrate()'s own comment on this in
										// store.jsx). That stale false silently reactivates first-time
										// checklist mode on replay instead of replay-continuation mode,
										// defeating name-collision suppression, hiding App Features, and
										// leaving the closing Generate card stuck permanently visible.
										// Any account that already has a real (non-sample) picker is
										// unambiguously past onboarding regardless of what checklistDone
										// happens to say, so correct it here, the one place we can be
										// sure right before a replay actually starts.
										// appFeaturesIntroSeen gets the same treatment for the same
										// reason: it's the one-time "One Last Thing..." tip that's meant
										// to ambush a user the FIRST moment App Features ever appears for
										// them, right after finishing a real checklist. An established
										// account replaying the tour has obviously already passed that
										// moment, so leaving it at whatever stale false an old export
										// happens to carry made the checklistDone fix above immediately
										// re-trigger that one-time intro (scroll + highlight) on every
										// single replay instead.
										const hasReaBoo = state.pickers.some( ( picCurObj ) => !ONB_SPI_ARR.includes( picCurObj.id ) ); // What: Has Real Boolean. Why: Only a real, established account (one holding at least 1 non-sample picker) needs this self-healing correction applied. How: This is true whenever any of state.pickers is not one of the seeded sample picker ids.

										actions.setOnboarding( { // What: Set Onboarding Call. Why: This is the actual reset of the tour's own onboarding flags, always clearing the core 4 and conditionally correcting the 2 self-healing ones. How: This spreads in checklistDone/appFeaturesIntroSeen only while hasReaBoo is true.


											welcomed : false, dismissed : true, appFeatures : {}, appFeaturesSectionResolved : false, checklist : {},
											...( hasReaBoo ? { checklistDone : true, appFeaturesIntroSeen : true } : {} )


										} );


									}}
								>Replay Tour</ButBasCom>{ /* What: Button Base Component. Why: This is the actual trigger that restarts the first-run walkthrough. How: This navigates home, then resets (and, for an established account, self-heals) the onboarding flags when clicked. */ }


							</div>


						</CarSurCom>

						<ConSupCom
							state={ state }
							actions={ actions }
						/>{ /* What: Contact Support Component. Why: The support form is substantial enough to live in its own component. How: This renders it, driven by the same shared state/actions this whole tab receives. */ }


					</section>

					{ /* ── Legal ─────────────────────────────────────────────────────── */ }
					<section
						className='set-section set-section--legal'
						ref={ ( secCurEle ) => { secMapRef.current[ 'legal' ] = secCurEle; } }
					>{ /* What: Legal Section Element. Why: This is the Legal section's own root, registering itself for scroll-spy/jump-to. How: This wraps the intro copy and the Privacy Policy/Terms of Service rows. */ }


						<div className='set-section-h'><span className='kicker'>Legal</span></div>{ /* What: Set Section H Div Element. Why: Every section names itself with this same small heading style. How: This renders the fixed text "Legal" inside the shared kicker span. */ }

						<p className='settings-sub'>The documents below outline what you&rsquo;re agreeing to by using Ease My Life.</p>{ /* What: Settings Sub Paragraph Element. Why: Every section has its own short intro line beneath its heading. How: This renders the fixed intro copy for Legal. */ }

						<CarSurCom>{ /* What: Card Surface Component. Why: Both document rows share one bordered container. How: This wraps the Privacy Policy row and the Terms of Service row. */ }


							<div className='set-data-row set-privacy-row'>{ /* What: Privacy Row Div Element. Why: The label/description and the View button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the View button. */ }


								<div className='set-data-info'>{ /* What: Privacy Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Privacy Policy</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Privacy Policy". */ }

									<span className='set-data-sub'>How your data is collected, used, and stored.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short description of what the document actually covers. How: This renders the fixed description. */ }


								</div>

								<button
									type='button'
									className='btn btn--secondary btn--sm'
									onClick={ () => setLegDocStr( 'privacy' ) }
								>View</button>{ /* What: Privacy View Button Element. Why: This is the actual trigger that opens the Privacy Policy inside LegModCom. How: This sets legDocStr to 'privacy' when clicked. */ }


							</div>

							<div className='set-data-row set-terms-row'>{ /* What: Terms Row Div Element. Why: The label/description and the View button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the View button. */ }


								<div className='set-data-info'>{ /* What: Terms Info Div Element. Why: The row's own name and description need their own grouping, apart from the button. How: This wraps the name span and the description span. */ }


									<span className='set-data-name'>Terms of Service</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Terms of Service". */ }

									<span className='set-data-sub'>The rules for using Ease My Life, including paid features.</span>{ /* What: Set Data Sub Span Element. Why: The row needs a short description of what the document actually covers. How: This renders the fixed description. */ }


								</div>

								<button
									type='button'
									className='btn btn--secondary btn--sm'
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

// #endregion TabSettings



export { TabSettings }; // What: Named Export. Why: app.jsx imports this by this exact name. How: This re-exports TabSettings as-is; every other binding in this file is internal-only.


