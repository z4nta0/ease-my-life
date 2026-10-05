


// #region Imports

import cssModObj from './theme-picker.module.css'; // What: CSS Module Object. Why: The theme subsections and rows are styled from their own module. How: This maps each class name in theme-picker.module.css to its hashed module class.
import React     from 'react';                     // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.Fragment) instead of importing individual named hooks.


import { APP_NAM_OBJ } from '../../platform/appearance.ts'; // What: Appearance Namespace Object. Why: The Theme section needs to look up each built-in theme's own preview colors. How: This is read as APP_NAM_OBJ.PAL_SET_OBJ[key] when rendering each preset theme row.
import { CarSurCom   } from '../../ui/card-surface.tsx';    // What: Card Surface Component. Why: The Light and Dark theme cards sit inside the shared bordered container. How: This wraps each card in TheSecCom.

// #endregion Imports



/**
 * theme-picker.tsx = Theme Picker
 *
 * @summary
 * The Appearance section's own Light and Dark theme cards: LIG_THE_ARR and
 * DAR_THE_ARR list each card's built-in themes, TheRowCom renders one preset
 * as a full-width strip (Option A from the mockups: background and accent
 * colors span the row, the name sits bottom-left), TheCusCom renders the
 * card's own editable custom row, and TheSecCom lays both cards out. Only one
 * theme is ever active; clicking a row in either card makes it the live theme
 * immediately, since there is no separate "current mode" to track.
 *
 * Sections:
 *  - Constants
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const DAR_THE_ARR = [ 'night', 'moss', 'ember' ]; // What: Dark Theme Array. Why: This is the fixed set of built-in dark-based theme keys the Dark card renders one row per. How: This is mapped in TheSecCom's own Dark card.



const LIG_THE_ARR = [ 'ink', 'sage', 'sand' ]; // What: Light Theme Array. Why: This is the fixed set of built-in light-based theme keys the Light card renders one row per. How: This is mapped in TheSecCom's own Light card.

// #endregion Constants



// #region Components

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
 * @param props.actStoObj - Actions Store Object: {@link useAppStaFun}
 * @param props.actTheBoo - Active Theme Boolean: Whether this specific custom
 *                          theme is the currently active one.
 * @param props.cusColObj - Custom Color Object: The user's own saved custom
 *                          colors for this mode, or null before any have been
 *                          set.
 * @param props.darModBoo - Dark Mode Boolean: Whether this row belongs to the
 *                          Dark card, for its own styling hook; omitted on the
 *                          Light card.
 * @param props.theModStr - Theme Mode String: Either 'light' or 'dark',
 *                          selecting which of the 2 custom themes this row
 *                          edits.
 *
 * @returns One theRowDiv div holding 3 live color inputs, a name input,
 * and (while active) a checkmark.
 *
 * @example
 * ```tsx
 * TheCusCom({ actStoObj, actTheBoo, ... }) // => <TheCusCom />
 * ```
 *
*/

function TheCusCom ( { actStoObj, actTheBoo, cusColObj, darModBoo, theModStr } ) {


	const draColObj = cusColObj || ( darModBoo // What: Draft Color Object. Why: A row with no saved custom colors yet still needs sane starting values for its own 3 live swatches. How: This falls back to a fixed dark or light starting palette when cusColObj is null.
		? { accent : '#7da4ff', bg : '#1e2230', text : '#f2f3f6' }    // What: Dark Starting Palette. Why: The Dark card's own custom row needs dark starting colors. How: This supplies a dark background with light text.
		: { accent : '#3360a8', bg : '#fcfbf9', text : '#242629' } ); // What: Light Starting Palette. Why: The Light card's own custom row needs light starting colors. How: This supplies a light background with dark text.


	const setColFun = ( colKeyStr, colValStr ) => actStoObj.setCusFun( theModStr, { ...draColObj, [ colKeyStr ] : colValStr } ); // What: Set Color Function. Why: Changing any one swatch must save the FULL custom color set back to the store, not just the one changed key. How: This spreads draColObj and overwrites just the one changed key before saving.



	return (


		<div
			className={` ${ cssModObj.theRowDiv }   ${ cssModObj.theRowDivCustom } `}

			data-option-select-active={ actTheBoo || undefined } // What: Option Select Active Attribute. Why: The selected custom row gets a solid frame and inherited label color from its module, and this row has no aria state of its own to key that off. How: This sets the presence-only attribute while actTheBoo is true and removes it otherwise.
			data-theme-dark-active={ darModBoo || undefined } // What: Theme Dark Active Attribute. Why: A dark theme's row switches its label, check, and name field to light-on-dark colors from its module. How: This sets the presence-only attribute while darModBoo is true and removes it otherwise.
		>{ /* What: Theme Row Div Element. Why: This is the whole custom-theme row, styled to match the preset rows above it. How: This renders 3 live color inputs, a name input, and (while active) a checkmark. */ }


			<input
				className={ cssModObj.cusSwaInp }

				style={{ flex : '1' }}

				type='color'
				value={ draColObj.bg }

				aria-label='Custom background color'
				title='Background'

				onChange={ ( chaEveObj ) => setColFun( 'bg', chaEveObj.target.value ) }
				onClick={ () => actStoObj.setTheFun( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
			/>{ /* What: Background Swatch Input Element. Why: This is the live control for the custom theme's own background color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				className={ cssModObj.cusSwaInp }

				style={{ flex : '0 0 34%' }}

				type='color'
				value={ draColObj.accent }

				aria-label='Custom accent color'
				title='Accent'

				onChange={ ( chaEveObj ) => setColFun( 'accent', chaEveObj.target.value ) }
				onClick={ () => actStoObj.setTheFun( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
			/>{ /* What: Accent Swatch Input Element. Why: This is the live control for the custom theme's own accent color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				className={ cssModObj.cusSwaInp }

				style={{ flex : '0 0 12%' }}

				type='color'
				value={ draColObj.text }

				aria-label='Custom text color'
				title='Text'

				onChange={ ( chaEveObj ) => setColFun( 'text', chaEveObj.target.value ) }
				onClick={ () => actStoObj.setTheFun( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
			/>{ /* What: Text Swatch Input Element. Why: This is the live control for the custom theme's own text color. How: This activates this custom theme on click and saves a new color via setColFun on change. */ }

			<input
				className={ cssModObj.cusNamInp }

				maxLength={ 18 }
				placeholder='Custom'
				type='text'
				value={ draColObj.name || '' }

				aria-label={ `Name for your custom ${ theModStr === 'dark' ? 'dark' : 'light' } theme` }

				onChange={ ( chaEveObj ) => actStoObj.renCusFun( theModStr, chaEveObj.target.value ) }
				onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }
				onFocus={ () => actStoObj.setTheFun( theModStr === 'dark' ? 'customDark' : 'customLight' ) }
			/>{ /* What: Custom Name Input Element. Why: A custom theme can carry its own user-chosen display name instead of a fixed preset name. How: This activates this custom theme on focus and saves the typed name via actStoObj.renCusFun on change, without also re-toggling the theme on every keystroke click. */ }

			{ actTheBoo && ( // What: Active Checkmark Check. Why: A checkmark should only exist while this specific custom theme is the active one. How: This renders the checkmark span only while actTheBoo is true.


				<span
					className={ cssModObj.theCheSpa }

					aria-hidden='true'
				>&#10003;</span> // What: Theme Row Check Span Element. Why: This is the actual checkmark glyph confirming the active theme. How: This renders a fixed checkmark character, hidden from screen readers since the row's own state already conveys this.


			) }


		</div>


	);


}

// #endregion TheCusCom



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
 * @param props.actTheBoo   - Active Theme Boolean: Whether this specific
 *                            theme is the currently active one.
 * @param props.darModBoo   - Dark Mode Boolean: Whether this row belongs to
 *                            the Dark card, for its own styling hook.
 * @param props.onActTheFun - On Activate Theme Function: Activates this theme
 *                            when the row itself is clicked or activated via
 *                            keyboard.
 * @param props.thePalObj   - Theme Palette Object: The resolved palette to
 *                            preview, read from
 *                            APP_NAM_OBJ.PAL_SET_OBJ[theKeyStr].
 *
 * @returns One theRowDiv div, acting as a radio option within its own
 * card's implicit radio group.
 *
 * @example
 * ```tsx
 * TheRowCom({ actTheBoo, darModBoo, ... }) // => <TheRowCom />
 * ```
 *
*/

function TheRowCom ( { actTheBoo, darModBoo, onActTheFun, thePalObj } ) {


	return (


		<div
			className={ cssModObj.theRowDiv }

			data-theme-dark-active={ darModBoo || undefined } // What: Theme Dark Active Attribute. Why: A dark theme's row switches its label, check, and name field to light-on-dark colors from its module. How: This sets the presence-only attribute while darModBoo is true and removes it otherwise.

			aria-checked={ actTheBoo }
			role='radio'
			tabIndex={ 0 }

			onClick={ onActTheFun }
			onKeyDown={ ( keyEveObj ) => { // What: Row Key Down Handler. Why: A div acting as a radio option must also activate from the keyboard, the way a native radio would. How: This activates the theme on Enter or Space, preventing Space's own default page scroll.


				if ( keyEveObj.key === 'Enter' || keyEveObj.key === ' ' ) { // What: Activation Key Check. Why: Only Enter and Space should activate the row. How: This runs the activation only for those 2 keys.


					keyEveObj.preventDefault(); // What: Default Prevention Call. Why: Space would otherwise also scroll the page. How: This cancels the key's own default action.

					onActTheFun(); // What: Theme Activation Call. Why: This is the actual keyboard activation. How: This calls onActTheFun, exactly as a click would.


				}


			} }
		>{ /* What: Theme Row Div Element. Why: This is the whole clickable/keyboard-activatable preview strip for one theme. How: This renders 3 stacked color swatches, the theme's own name, and (while active) a checkmark. */ }


			<i
				className={ cssModObj.theSwaIta }

				style={{ background : thePalObj.surStr }}
			/>{ /* What: Surface Swatch Element. Why: This previews the theme's own background color across the bulk of the row. How: This is a bare, flex-grown <i> colored via thePalObj's own surStr. */ }

			<i
				className={ cssModObj.theSwaIta }

				style={{
					background : thePalObj.accStr,
					flex       : '0 0 34%'
				}}
			/>{ /* What: Accent Swatch Element. Why: This previews the theme's own accent color as a fixed-width sliver. How: This is a bare <i> colored via thePalObj's own accStr, at a fixed 34% width. */ }

			<i
				className={ cssModObj.theSwaIta }

				style={{
					background : thePalObj.warStr,
					flex       : '0 0 12%'
				}}
			/>{ /* What: Warn Swatch Element. Why: This previews the theme's own warn color as a fixed-width sliver. How: This is a bare <i> colored via thePalObj's own warStr, at a fixed 12% width. */ }

			<span className={ cssModObj.theLabSpa }>{ thePalObj.namStr }</span>{ /* What: Theme Name Span Element. Why: Every row needs its own visible theme name. How: This renders thePalObj's own namStr. */ }

			{ actTheBoo && ( // What: Active Checkmark Check. Why: A checkmark should only exist on whichever single row is currently active. How: This renders the checkmark span only while actTheBoo is true.


				<span
					className={ cssModObj.theCheSpa }

					aria-hidden='true'
				>&#10003;</span> // What: Theme Row Check Span Element. Why: This is the actual checkmark glyph confirming the active theme. How: This renders a fixed checkmark character, hidden from screen readers since aria-checked already conveys this.


			) }


		</div>


	);


}

// #endregion TheRowCom



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
 * @param props.actStoObj - Actions Store Object: {@link useAppStaFun}
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 *
 * @returns Both theme cards, Light then Dark, as a fragment.
 *
 * @example
 * ```tsx
 * TheSecCom({ actStoObj, staAppObj }) // => <TheSecCom />
 * ```
 *
*/

function TheSecCom ( { actStoObj, staAppObj } ) {


	const appCurObj = staAppObj.appearance || { customDark : null, customLight : null, theme : 'ink' }; // What: Appearance Current Object. Why: A very old/incomplete persisted state might not carry an appearance object at all. How: This falls back to a default ink/no-custom-themes object when staAppObj.appearance is missing.



	return (


		<React.Fragment>{ /* What: Theme Section Fragment Element. Why: The Light and Dark subsections are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


			<div
				className={ cssModObj.setSubDiv }

				data-element-name-hook='theLigDiv'
			>{ /* What: Theme Light Subsection Div Element. Why: The Light card needs its own labeled subsection, matching every other Appearance subsection. How: This wraps the subsection heading, its explanatory copy, and the Light theme CarSurCom. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


				<div className={ cssModObj.subHeaDiv }>Theme &middot; Light</div>{ /* What: Set Subsection H Div Element. Why: Every subsection in Appearance names itself with this same heading style. How: This renders the fixed heading "Theme · Light". */ }

				<p className={ cssModObj.secSubPar }>{ /* What: Settings Sub Paragraph Element. Why: The Light theme picker needs explanatory copy above its own card, matching every other subsection. How: This renders fixed copy about picking or creating a light theme. */ }


					Pick a light based theme below or create your own. If you enable the system
					preference option, the corresponding dark theme (e.g. Ink &rarr; Night) will be applied
					when applicable.


				</p>

				<p className={ cssModObj.secSubPar }>{ /* What: Settings Sub Paragraph Element. Why: The custom-theme behavior deserves its own explanatory paragraph, separate from the general picker copy above. How: This renders fixed copy about the auto-generated inverse dark theme. */ }


					If you create a custom light theme then the app will automatically create an
					inverse dark theme from those colors, which you are then free to edit afterwards.


				</p>



				<CarSurCom>{ /* What: Card Surface Component. Why: The 3 preset rows and the custom row need a shared bordered container, matching every other picker in this tab. How: This wraps LIG_THE_ARR's own mapped rows plus the trailing TheCusCom. */ }


					{ LIG_THE_ARR.map( ( theKeyStr ) => ( // What: Light Theme Map. Why: One preview row is needed per entry in LIG_THE_ARR. How: This maps LIG_THE_ARR into one TheRowCom per key, each looking up its own palette from APP_NAM_OBJ.PAL_SET_OBJ.


						<TheRowCom
							key={ theKeyStr }

							actTheBoo={ appCurObj.theme === theKeyStr }
							thePalObj={ APP_NAM_OBJ.PAL_SET_OBJ[ theKeyStr ] }

							onActTheFun={ () => actStoObj.setTheFun( theKeyStr ) }
						/> // What: Theme Row Component. Why: This previews and activates one built-in light theme. How: This is passed its own palette, whether it is the active theme, and the activation callback.


					) ) }



					<TheCusCom
						actStoObj={ actStoObj }
						actTheBoo={ appCurObj.theme === 'customLight' }
						cusColObj={ appCurObj.customLight }
						theModStr='light'
					/>{ /* What: Theme Custom Component. Why: The Light card's own custom-theme row sits after its 3 presets. How: This is passed the user's saved custom-light colors, if any, and whether that custom theme is currently active. */ }


				</CarSurCom>


			</div>

			<div
				className={ cssModObj.setSubDiv }

				data-element-name-hook='theDarDiv'
			>{ /* What: Theme Dark Subsection Div Element. Why: The Dark card needs its own labeled subsection, matching the Light one above. How: This wraps the subsection heading, its explanatory copy, and the Dark theme CarSurCom. Its data-element-name-hook is read by the App Features tours and help mode's Settings catalog. */ }


				<div className={ cssModObj.subHeaDiv }>Theme &middot; Dark</div>{ /* What: Set Subsection H Div Element. Why: Every subsection in Appearance names itself with this same heading style. How: This renders the fixed heading "Theme · Dark". */ }

				<p className={ cssModObj.secSubPar }>{ /* What: Settings Sub Paragraph Element. Why: The Dark theme picker needs explanatory copy above its own card, matching the Light one above. How: This renders fixed copy about picking or creating a dark theme. */ }


					Pick a dark based theme below or create your own. If you enable the system
					preference option, the corresponding light theme (e.g. Night &rarr; Ink) will be applied
					when applicable.


				</p>

				<p className={ cssModObj.secSubPar }>{ /* What: Settings Sub Paragraph Element. Why: The custom-theme behavior deserves its own explanatory paragraph here too, separate from the general picker copy above. How: This renders fixed copy about the auto-generated inverse light theme. */ }


					If you create a custom dark theme then the app will automatically create an
					inverse light theme from those colors, which you are then free to edit afterwards.


				</p>



				<CarSurCom>{ /* What: Card Surface Component. Why: The 3 preset rows and the custom row need a shared bordered container, matching the Light card above. How: This wraps DAR_THE_ARR's own mapped rows plus the trailing TheCusCom. */ }


					{ DAR_THE_ARR.map( ( theKeyStr ) => ( // What: Dark Theme Map. Why: One preview row is needed per entry in DAR_THE_ARR. How: This maps DAR_THE_ARR into one TheRowCom per key, each looking up its own palette from APP_NAM_OBJ.PAL_SET_OBJ.


						<TheRowCom
							key={ theKeyStr }

							actTheBoo={ appCurObj.theme === theKeyStr }
							darModBoo
							thePalObj={ APP_NAM_OBJ.PAL_SET_OBJ[ theKeyStr ] }

							onActTheFun={ () => actStoObj.setTheFun( theKeyStr ) }
						/> // What: Theme Row Component. Why: This previews and activates one built-in dark theme. How: This is passed its own palette, whether it is the active theme, and the activation callback.


					) ) }



					<TheCusCom
						actStoObj={ actStoObj }
						actTheBoo={ appCurObj.theme === 'customDark' }
						cusColObj={ appCurObj.customDark }
						darModBoo
						theModStr='dark'
					/>{ /* What: Theme Custom Component. Why: The Dark card's own custom-theme row sits after its 3 presets. How: This is passed the user's saved custom-dark colors, if any, and whether that custom theme is currently active. */ }


				</CarSurCom>


			</div>


		</React.Fragment>


	);


}

// #endregion TheSecCom

// #endregion Components



// #region Exports

export { TheSecCom }; // What: Named Export. Why: TabSetCom renders the theme cards in its Appearance section. How: This exports TheSecCom by name; TheCusCom, TheRowCom, and the theme key arrays stay private to this file.

// #endregion Exports


