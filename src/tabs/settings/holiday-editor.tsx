


// #region Imports

import cssModObj from './holiday-editor.module.css'; // What: CSS Module Object. Why: The holiday list and its add form are styled from their own module. How: This maps each class name in holiday-editor.module.css to its hashed module class.
import React     from 'react';                       // What: React. Why: HolEdiCom is built directly on React's own APIs. How: This is used directly (React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom   } from '../../ui/button.tsx';    // What: Button Base Component. Why: Adding a custom holiday needs a consistently-styled button. How: This is rendered in HolEdiCom's own add form.
import { durMilFun   } from '../../utils/rhythm.ts';  // What: Duration Millisecond Function. Why: The row's exit timer must end with its exit animation. How: This returns a duration step's length in milliseconds.
import { HOL_NAM_OBJ } from '../../core/holidays.ts'; // What: Holidays Namespace Object. Why: The Holidays section needs both a default holidays-state shape and the computed U.S. holiday list for the current year. How: This is called via HOL_NAM_OBJ.defStaFun() and HOL_NAM_OBJ.comYeaFun() inside HolEdiCom.
import { IcoSvgCom   } from '../../ui/icon.tsx';      // What: Icon Svg Component. Why: The custom-holiday delete button needs a small trash glyph. How: This is rendered with a specific name/size prop.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The component changes state through the store's actions. How: This types its actStoObj.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The component reads the current app state. How: This types its staAppObj.

// #endregion Imports



/**
 * holiday-editor.tsx = Holiday Editor
 *
 * @summary
 * The Holidays section's own editable list: HolEdiCom shows every computed
 * U.S. holiday for the current year, each toggleable on or off for the "Skip
 * on holidays" gate every picker reads, plus the user's own custom recurring
 * days off, with a small form beneath the list for adding another one.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type HecProTyp = { actStoObj : ActStoTyp, staAppObj : StaAppTyp }; // What: Holiday-Editor-Component Props Type. Why: The holiday list reads the saved holidays and changes them through the store. How: This types HolEdiCom's props.

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
 * @param props.actStoObj - Actions Store Object: {@link useAppStaFun}
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 *
 * @returns The holiday list (computed rows plus custom rows) and the
 * "add a holiday" form beneath it, as a fragment.
 *
 * @example
 * ```tsx
 * HolEdiCom({ actStoObj, staAppObj }) // => <HolEdiCom />
 * ```
 *
*/

function HolEdiCom ( { actStoObj, staAppObj } : HecProTyp ) : React.JSX.Element {


	// #region Holiday Data

	const curYeaNum = new Date().getFullYear();                              // What: Current Year Number. Why: The computed U.S. holiday list is specific to a single calendar year. How: This reads the real device's current year and is passed to HOL_NAM_OBJ.comYeaFun below.
	const holStaObj = staAppObj.holidays || HOL_NAM_OBJ.defStaFun();         // What: Holiday State Object. Why: A very old persisted state might not carry a holidays sub-object at all. How: This falls back to HOL_NAM_OBJ's own default shape when staAppObj.holidays is missing.
	const comHolArr = HOL_NAM_OBJ.comYeaFun( curYeaNum, holStaObj.country ); // What: Computed Holiday Array. Why: The list needs every rule-computed U.S. holiday for the current year and country. How: This calls HOL_NAM_OBJ.comYeaFun with the current year and the user's saved country.
	const disKeyArr = holStaObj.disabled || [];                              // What: Disabled Key Array. Why: A toggled-off computed holiday must still render, just marked disabled. How: This is checked per-row below via .includes to decide each row's on/off state.
	const cusHolArr = holStaObj.custom || [];                                // What: Custom Holiday Array. Why: The user's own added recurring days off need to render in their own list, below the computed ones. How: This is mapped below into its own set of rows.

	// #endregion Holiday Data



	// #region Custom Holiday State

	const [ draNamStr, setDraNamStr ] = React.useState( '' );   // What: Draft Name String And Setter. Why: The "add a holiday" form needs somewhere to hold the name being typed before it is actually added. How: This is bound to the name input below and read by addCusFun.
	const [ draDatStr, setDraDatStr ] = React.useState( '' );   // What: Draft Date String And Setter. Why: The "add a holiday" form needs somewhere to hold the date being picked before it is actually added. How: This is bound to the date input below and read by addCusFun.
	const [ exiIdeStr, setExiIdeStr ] = React.useState( null ); // What: Exiting Identifier String And Setter. Why: A removed custom holiday should play its fade-up-and-out exit before the row actually disappears. How: This holds the id currently mid-exit, checked per-row below to apply the module's holRowIteExiting class.


	// #region rmvExiFun

	/**
	 * rmvExiFun = Remove Exit Function
	 *
	 * @summary
	 * Deletes a custom holiday after its row plays its exit animation: it flags
	 * the row as exiting at once, then removes the holiday from the store 300ms
	 * later.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param cusIdeStr - Custom Identifier String: The id of the custom holiday
	 *                    to remove.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * rmvExiFun(cusIdeStr) // => void
	 * ```
	 *
	*/

	const rmvExiFun = ( cusIdeStr ) => { // What: Remove Exit Function. Why: Deleting a custom holiday should not simply vanish the row; it should play its own exit animation first. How: This flags cusIdeStr as exiting, then removes it from the store 300ms later, once that animation has had time to play.


		setExiIdeStr( cusIdeStr ); // What: Exiting Identifier Set. Why: This is what actually triggers the row's own exit class below. How: This writes the removed row's own id into exiIdeStr.

		setTimeout( () => { // What: Delayed Removal Timeout. Why: The store must not drop the row until the fade-up-and-out animation has actually had time to play. How: This waits out the exit's p02 duration step, then removes the holiday from the store and clears exiIdeStr.


			actStoObj.delHolFun( cusIdeStr ); // What: Custom Holiday Delete Call. Why: This is the actual store mutation that removes the recurring day off. How: This calls actStoObj.delHolFun with the removed row's own id.

			setExiIdeStr( null ); // What: Exiting Identifier Clear. Why: The row is gone, so nothing is mid-exit anymore. How: This resets exiIdeStr back to null.


		}, durMilFun( 'p02' ) ); // What: Exit Animation Delay. Why: The row must finish fading out before the store drops it. How: This waits the same p02 duration step its exit keyframes play over. // Duration Base Plus 2 ~= 277.0ms


	};

	// #endregion rmvExiFun

	// #endregion Custom Holiday State



	// #region Date Formatting

	const shoDatFun = ( holDatObj ) => holDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'short' } );                          // What: Short Date Function. Why: Every computed holiday row needs a compact "Weekday, Month Day" label for when it lands. How: This formats holDatObj via toLocaleDateString with short weekday/month and numeric day.
	const reaDayFun = ( holDatObj ) => holDatObj.toLocaleDateString( 'en-US', { weekday : 'long' } );                                                             // What: Real Day Function. Why: An observed holiday (one shifted off a weekend) needs to also say which weekday it actually falls on. How: This formats holDatObj as just its own full weekday name.
	const recDatFun = ( monValNum, dayValNum ) => new Date( 2001, monValNum - 1, dayValNum ).toLocaleDateString( 'en-US', { day : 'numeric', month : 'short' } ); // What: Recur Date Function. Why: A custom holiday recurs every year on the same month/day, so it needs a year-agnostic "Month Day" label instead of a real date. How: This builds a throwaway Date in a fixed dummy year purely to reuse toLocaleDateString's own formatting.

	// #endregion Date Formatting



	const addCusFun = () => { // What: Add Custom Function. Why: The "add a holiday" form's own Add button needs to turn its 2 draft fields into a real custom holiday. How: This validates both drafts are filled, parses the date input's own month/day, adds the holiday, then clears both drafts.


		if ( !draNamStr.trim() || !draDatStr ) return; // What: Draft Validity Guard. Why: Both a name and a date are required before anything can be added. How: This bails out early whenever either draft is still empty/blank.



		const [ , monValNum, dayValNum ] = draDatStr.split( '-' ).map( Number ); // What: Month Value Number And Day Value Number. Why: A custom holiday recurs by month/day only, not by the specific year the date input happened to show. How: This splits the "YYYY-MM-DD" draft and discards the year, keeping only the numeric month and day.


		actStoObj.addHolFun({ // What: Add Custom Holiday Call. Why: This is the actual store mutation that creates the new recurring day off. How: This calls actStoObj.addHolFun with the trimmed name and the parsed month/day.


			day   : dayValNum,       // What: Day. Why: This is the recurring day of the month. How: This passes the parsed day straight through.
			month : monValNum,       // What: Month. Why: This is the recurring month of the year. How: This passes the parsed month straight through.
			name  : draNamStr.trim() // What: Name. Why: This is the holiday's own display name. How: This passes the typed draft name, trimmed of stray whitespace.


		});

		setDraNamStr( '' ); // What: Draft Name Reset. Why: A successfully added holiday should leave the form empty and ready for the next one. How: This clears the name draft back to an empty string.
		setDraDatStr( '' ); // What: Draft Date Reset. Why: A successfully added holiday should leave the form empty and ready for the next one. How: This clears the date draft back to an empty string.


	};



	return (


		<React.Fragment>{ /* What: Holiday Editor Fragment Element. Why: The holiday list and the add form below it are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


			<ul
				className={ cssModObj.holLisUno }

				data-element-name-hook='holLisUno'
			>{ /* What: Holiday List Ul Element. Why: This is the whole editable list, computed holidays first, then any custom ones. How: This maps comHolArr and then cusHolArr into their own rows below. Its data-element-name-hook is read by help mode's Settings catalog. */ }


				{ comHolArr.map( ( holCurObj ) => { // What: Computed Holiday Map. Why: One row is needed per rule-computed holiday for the current year. How: This maps comHolArr, deriving each row's own on/off state from disKeyArr before rendering it.


					const holEnaBoo = !disKeyArr.includes( holCurObj.keyStr ); // What: Holiday Enabled Boolean. Why: A row's own switch and label both depend on whether this specific holiday is currently enabled. How: This is true unless the holiday's own key appears in disKeyArr.



					return (


						<li
							key={ holCurObj.keyStr }

							className={ cssModObj.holRowIte }

							data-holiday-off-active={ !holEnaBoo || undefined } // What: Holiday Off Active Attribute. Why: A turned-off holiday's name mutes and its date is struck through by its module. How: This sets the presence-only attribute while holEnaBoo is false and removes it otherwise.
						>{ /* What: Holiday Row Li Element. Why: Each computed holiday needs its own row pairing its name/date info with an on/off switch. How: This renders holCurObj's own name and date, plus a switch bound to holEnaBoo. */ }


							<div className={ cssModObj.holInfDiv }>{ /* What: Holiday Info Div Element. Why: The name and date need their own grouping, separate from the switch. How: This wraps the name span and the date span below. */ }


								<span className={ cssModObj.holNamSpa }>{ holCurObj.namStr }</span>{ /* What: Holiday Name Span Element. Why: Every row needs its own visible holiday name. How: This renders holCurObj's own name field. */ }

								<span className={ cssModObj.holDatSpa }>{ /* What: Holiday Date Span Element. Why: The landing date, and (when observed) the real weekday it falls on, need their own grouping. How: This wraps the main date span and, conditionally, the observed-note span below. */ }


									<span className={ cssModObj.datMaiSpa }>{ shoDatFun( holCurObj.datObj ) }</span>{ /* What: Holiday Date Main Span Element. Why: Every row needs a compact landing-date label. How: This renders holCurObj's own date, formatted via shoDatFun. */ }

									{ holCurObj.obsBoo && ( // What: Observed Note Check. Why: A holiday shifted off a weekend needs to also explain which real weekday it falls on. How: This renders the observed-note span only while holCurObj.obsBoo is true.


										<span className={ cssModObj.holObsSpa }>observed &middot; { holCurObj.namStr === 'New Year\'s Day' ? 'falls' : 'lands' } on a { reaDayFun( holCurObj.actObj ) }</span> // What: Holiday Obs Span Element. Why: This is the actual observed-weekday note text. How: This renders "falls"/"lands" (New Year's Day reads more naturally as "falls") followed by the real weekday from reaDayFun.


									) }


								</span>


							</div>

							<button
								className={ cssModObj.togSwiBut }

								data-element-name-hook='togSwiBut'

								aria-label={ `${ holEnaBoo ? 'Disable' : 'Enable' } ${ holCurObj.namStr }` }
								aria-pressed={ holEnaBoo }

								onClick={ () => actStoObj.togHolFun( holCurObj.keyStr ) }
							>{ /* What: Holiday Switch Button Element. Why: Every computed holiday needs a way to toggle it off/on without deleting it outright. How: This calls actStoObj.togHolFun with this row's own key when clicked. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<i className={ cssModObj.swiKnoIta } />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-pressed state. */ }


							</button>


						</li>


					);


				} ) }


				{ cusHolArr.map( ( cusCurObj ) => ( // What: Custom Holiday Map. Why: One row is needed per user-added recurring day off. How: This maps cusHolArr into its own rows, each flagged exiting via exiIdeStr.


					<li
						key={ cusCurObj.id }

						className={` ${ cssModObj.holRowIte }   ${ cssModObj.holRowIteEnter }   ${ exiIdeStr === cusCurObj.id ? cssModObj.holRowIteExiting : '' } `}
					>{ /* What: Custom Holiday Row Li Element. Why: Each custom holiday needs its own row pairing its name/recurrence info with a delete button. How: This renders cusCurObj's own name and recurring date, plus a delete button bound to rmvExiFun. */ }


						<div className={ cssModObj.holInfDiv }>{ /* What: Holiday Info Div Element. Why: The name and recurrence need their own grouping, separate from the delete button. How: This wraps the name span and the date span below. */ }


							<span className={ cssModObj.holNamSpa }>{ cusCurObj.name }</span>{ /* What: Holiday Name Span Element. Why: Every row needs its own visible holiday name. How: This renders cusCurObj's own name field. */ }

							<span className={` ${ cssModObj.holDatSpa }   ${ cssModObj.holDatSpaCustom } `}>{ /* What: Holiday Date Span Element. Why: A custom holiday's recurrence label needs its own grouping. How: This wraps the recurrence label and the "every year" note below. */ }


								<span>{ recDatFun( cusCurObj.month, cusCurObj.day ) }</span>{ /* What: Recur Label Span Element. Why: Every custom row needs a year-agnostic "Month Day" label. How: This renders cusCurObj's own month/day, formatted via recDatFun. */ }

								<span className={ cssModObj.holReuSpa }>&middot; every year</span>{ /* What: Holiday Recur Span Element. Why: A custom holiday recurs annually, and that is not otherwise obvious from the date label alone. How: This renders a fixed "every year" note. */ }


							</span>


						</div>

						<button
							className={ cssModObj.holDelBut }

							aria-label={ `Remove ${ cusCurObj.name }` }

							onClick={ () => rmvExiFun( cusCurObj.id ) }
						>{ /* What: Custom Holiday Delete Button Element. Why: A user-added holiday needs its own way to be removed entirely, unlike a computed one which can only be disabled. How: This calls rmvExiFun with this row's own id when clicked. */ }


							<IcoSvgCom
								icoNamStr='traEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The delete button needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed small size. */ }


						</button>


					</li>


				) ) }


			</ul>



			<div
				className={ cssModObj.holAddDiv }

				data-element-name-hook='holAddDiv'
			>{ /* What: Holiday Add Div Element. Why: Adding a custom holiday needs its own small form beneath the list. How: This wraps the name input, date input, and Add button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


				<input
					className={ cssModObj.holNamInp }

					autoComplete='off'
					placeholder='Add a holiday, e.g. Birthday'
					type='text'
					value={ draNamStr }

					aria-label='Name of the day off to add'

					onChange={ ( chaEveObj ) => setDraNamStr( chaEveObj.target.value ) }
					onKeyDown={ ( keyEveObj ) => { // What: Name Key Down Handler. Why: The name field needs keyboard shortcuts for submitting and backing out. How: This submits on Enter and blurs on Escape.


						if ( keyEveObj.key === 'Enter' ) addCusFun(); // What: Enter Submit Branch. Why: Enter should submit the typed name the same way clicking Add would. How: This calls addCusFun.

						else if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); // What: Escape Blur Branch. Why: Escape should back out of the field without submitting, matching every other text input in this tab. How: This blurs the input via keyEveObj.currentTarget.


					} }
				/>{ /* What: Draft Name Input Element. Why: The user needs a text field to type a new holiday's own name into. How: This is bound to draNamStr, submits on Enter, and blurs on Escape like every other text input in this tab. */ }

				<input
					className={ cssModObj.holDatInp }

					type='date'
					value={ draDatStr }

					aria-label='Date'

					onChange={ ( chaEveObj ) => setDraDatStr( chaEveObj.target.value ) }
					onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) keyEveObj.currentTarget.blur(); } }
				/>{ /* What: Draft Date Input Element. Why: The user needs a native date picker to choose the new holiday's own recurring month/day. How: This is bound to draDatStr and blurs on Escape like every other input in this tab. */ }



				<ButBasCom
					disabled={ !draNamStr.trim() || !draDatStr }
					icoNamStr='pluEle'
					kinValStr='primary'
					sizValStr='sm'

					onClick={ addCusFun }
				>Add</ButBasCom>{ /* What: Button Base Component. Why: The form needs an explicit submit action, disabled until both drafts are filled. How: This calls addCusFun when clicked. */ }


			</div>


		</React.Fragment>


	);


}

// #endregion HolEdiCom

// #endregion Components



// #region Exports

export { HolEdiCom }; // What: Named Export. Why: TabSetCom renders the holiday list in its Holidays section. How: This exports HolEdiCom by name.

// #endregion Exports


