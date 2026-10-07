


// #region Imports

import cssModObj from './reminders-manager.module.css'; // What: CSS Module Object. Why: The Reminders section's card, settings matrix, rows, and editor are styled from their own module. How: This maps each class name in reminders-manager.module.css to its hashed module class.
import React     from 'react';                          // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.tsx';                 // What: Button Base Component. Why: The add form and each open reminder's own actions need consistently-styled buttons. How: This is rendered throughout RemManCom.
import { ColDisCom    } from '../../ui/collapse.tsx';               // What: Collapse Disclosure Component. Why: Each reminder row and the add form need to animate open and closed instead of snapping. How: This wraps each of those bodies in RemManCom, driven by its own open state.
import { durMilFun    } from '../../utils/rhythm.ts';               // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { EdiFooCom    } from '../../ui/editor-footer.tsx';          // What: Editor Footer Component. Why: Every reminder editor ends with the same Delete/Cancel/Save row. How: This is rendered at the bottom of each reminder editor.
import { freEdiFun    } from './list-sorting.ts';                   // What: Freeze Edited Function. Why: The Data tab's reminder list must not visibly reorder out from under an open editor as its own fields change. How: This is called once to compute disTasArr from sorTasArr.
import { IcoSvgCom    } from '../../ui/icon.tsx';                   // What: Icon Svg Component. Why: Every reminder row and button needs a recognizable glyph. How: This is rendered throughout OptMatCom and RemManCom.
import { InfTipCom    } from '../../ui/info-tip.tsx';               // What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while a mini-tour checklist is in progress. How: This wraps the disabled add button in RemManCom.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.ts'; // What: Onboarding Checklist Object. Why: Adding a reminder must stay disabled while any onboarding tutorial is still in progress. How: This is read via its own tutProFun helper in RemManCom.
import { redMotFun    } from '../../utils/motion.ts';               // What: Reduce Motion Function. Why: A user who prefers reduced motion should get an instant close or remove instead of a timed animation. How: This is checked before every staged animation in RemManCom.
import { SchEdiCom    } from '../../ui/schedule-editor.tsx';        // What: Schedule Editor Component. Why: A reminder's own repeat and schedule fields are edited with one shared editor. How: This is rendered for the add form and each open reminder.
import { sorEntFun    } from './list-sorting.ts';                   // What: Sort Entries Function. Why: The Data tab's reminder list needs the exact same sort vocabulary as the rest of the Data tab. How: This is called once per comparison inside RemManCom's own sorTasArr sort.
import { SorSelCom    } from './sort-select.tsx';                   // What: Sort Select Component. Why: The Data tab's reminder Items list needs the same sort control as every other Data tab list. How: This is rendered in RemManCom, driven by ITE_SOR_ARR.
import { TAS_NAM_OBJ  } from '../../core/tasks.ts';                 // What: Tasks Namespace Object. Why: Every reminder's own summary, next date, and default shape defer to the reminders engine instead of duplicating its logic. How: This namespace object is called throughout RemManCom.
import { UnmWatCom    } from '../../ui/unmount-watcher.ts';         // What: Unmount Watcher Component. Why: An open reminder row or the settings matrix that disappears without its own Save still keeps its edits. How: This is rendered inside each, reporting its unmount.
import { useTasDraFun } from '../../ui/record-draft.ts';            // What: Use Task Draft Function. Why: The open reminder row edits a local draft, committed when the row closes. How: This is called once inside RemManCom with the open reminder.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The component changes state through the store's actions. How: This types its actStoObj.
import type { RemClaTyp } from '../../core/data-model.ts'; // What: Reminder Class Type. Why: Each changed setting is written by its key. How: This types the setting keys read from the draft.
import type { RemOptTyp } from '../../core/data-model.ts'; // What: Reminder Options Type. Why: The matrix edits both classes' switches. How: This types OmcProTyp's options.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The component reads the current app state. How: This types its staAppObj.
import type { TasRcdTyp } from '../../core/data-model.ts'; // What: Task Record Type. Why: The new-reminder draft and the handled-draft mark each hold a reminder. How: This types that state and ref.

// #endregion Imports



/**
 * reminders-manager.tsx = Reminders Manager
 *
 * @summary
 * The Data tab's own Reminders section: RemManCom lists every reminder as a
 * collapsible, sortable row (ITE_SOR_ARR holds its sort options) whose body is
 * the shared schedule editor, with an add form above the list. OptMatCom is
 * the section's own Controls body, the participation matrix of global reminder
 * settings (one row per REM_MAT_ARR entry, whose sub-explanations paiSubFun
 * builds), with its own Cancel/Save.
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

// #region ITE_SOR_ARR

/**
 * ITE_SOR_ARR = Item Sort Array
 *
 * @summary
 * Item-list sort options for the Data tab's Reminders section,
 * extrapolated from the same vocabulary as the Data tab's own
 * section/item sorts (see sorEntFun in list-sorting.ts). Reminders
 * have no per-item Active/Inactive concept (no enabled/disabled
 * toggle, only a schedule and a today's-completion state, which isn't
 * the same thing) and no Group, so only Name and Type (One-time vs
 * Recurring) apply besides Date, the reminder's own next eligible
 * occurrence (TAS_NAM_OBJ.nexEliFun), the same date a Skip confirm
 * already computes elsewhere in this file. Labeled Soonest/Latest
 * rather than "Low to High"/"High to Low" like the numeric sorts
 * elsewhere, matching the app's own wording for date proximity (e.g.
 * the ease editor's Soonest/Latest). A reminder with no next
 * occurrence at all (rare, effectively stale, normally purged before
 * it'd ever be seen here) is a genuinely missing value, not an
 * irrelevant field the way Range/Odds/Boost are for a conditional
 * whose mode doesn't use them, so it uses sorEntFun's ordinary
 * top/bottom-by-direction N/A placement rather than always-last.
 *
 * Every entry shares one shape. Each row's own comment explains its
 * `keyStr`, while `labStr` repeats no comment of its own:
 *
 * - `keyStr` (String): Key String, the sort id SorSelCom compares
 *   against iteSorStr and reports via onChange.
 *
 * - `labStr` (String): Label String, the option's own visible menu
 *   text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ITE_SOR_ARR = [ // What: Item Sort Array. Why: RemManCom's own Items list sort control needs one entry per supported sort. How: This is passed as SorSelCom's own options prop from RemManCom below.


	{ keyStr : 'name-asc',  labStr : 'Name (A–Z)' }, // What: Key String. Why: This is the section's own default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'name-desc', labStr : 'Name (Z–A)' }, // What: Key String. Why: This is the reverse of the default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-asc',  labStr : 'Type (A–Z)' }, // What: Key String. Why: Type (One-time vs Recurring) is the only other text-like field reminders have. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-desc', labStr : 'Type (Z–A)' }, // What: Key String. Why: This is the reverse of the type sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-asc',  labStr : 'Soonest'    }, // What: Key String. Why: Date sorts by each reminder's own next eligible occurrence. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-desc', labStr : 'Latest'     }  // What: Key String. Why: This is the reverse of the date sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.


];

// #endregion ITE_SOR_ARR

// #endregion Constants



// #region Helpers

// #region paiSubFun

/**
 * paiSubFun = Pair Sub Function
 *
 * @summary
 * Data tab: full reminder management. Builds the dynamic
 * sub-explanation for a paired one-time/recurring toggle row, so it
 * always reflects which of the 2 types the setting actually applies
 * to right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param verTexStr - Version Text String: The trailing clause naming what the
 *                    setting does, e.g. 'trigger the day streak in the Today
 *                    page'.
 * @param neiConStr - Neither Conjunction String: The conjunction used in the
 *                    neither-selected phrasing, defaulting to 'and' ('nor'
 *                    reads better for a negatively-phrased verb).
 *
 * @returns A function of (oncEnaBoo, reuEnaBoo) that renders the correct
 * one of the 4 mutually-exclusive sub-explanation phrases.
 *
 * @example
 * ```ts
 * paiSubFun(verTexStr, neiConStr) // => (oncEnaBoo, reuEnaBoo) => <>...</>
 * ```
 *
*/

function paiSubFun ( verTexStr : string, neiConStr : string = 'and' ) : ( oncEnaBoo : boolean, reuEnaBoo : boolean ) => React.JSX.Element {


	return ( oncEnaBoo, reuEnaBoo ) => ( // What: Pair Sub Return. Why: The caller (each REM_MAT_ARR entry's own dynFun) needs a function it can call with the live once/recurring toggle states. How: This renders one of the 4 mutually-exclusive phrases below.


		oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes has the setting on. How: This tests both flags first.
			? <><strong>both</strong> one-time and recurring items will { verTexStr }</>              // What: Both Phrase. Why: Both classes have this setting on. How: This names both item kinds.
			: oncEnaBoo                                                                               // What: Once-Only Check. Why: Only one class may have the setting on. How: This tests the one-time flag next.
			? <><strong>only</strong> one-time items will { verTexStr }</>                            // What: Once-Only Phrase. Why: Only the one-time class has this setting on. How: This names only one-time items.
			: reuEnaBoo                                                                               // What: Recurring-Only Check. Why: The recurring class may be the only one on. How: This tests the recurring flag last.
			? <><strong>only</strong> recurring items will { verTexStr }</>                           // What: Recurring-Only Phrase. Why: Only the recurring class has this setting on. How: This names only recurring items.
			: <><strong>neither</strong> one-time { neiConStr } recurring items will { verTexStr }</> // What: Neither Phrase. Why: Neither class has this setting on. How: This names neither item kind, joined by neiConStr.


	);


}

// #endregion paiSubFun



// #region REM_MAT_ARR

/**
 * REM_MAT_ARR = Reminder Matrix Array
 *
 * @summary
 * Every entry below shares this exact shape, mapped over in OptMatCom's
 * own JSX to render one participation-matrix row per entry; none of
 * the 5 entries repeat these same fields' own boilerplate comments on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). Each entry's own leading comment instead
 * just names which specific setting it represents.
 *
 * - `dynFun` (Function): Dynamic Function is the row's own live
 *   sub-explanation, called by OptMatCom with the once/recurring
 *   classes' own current on/off state and returning the JSX phrase to
 *   render; every entry below builds this via paiSubFun, except the
 *   last, which is written out directly for its own documented reason.
 *
 * - `keyStr` (String): Key String ties this row to its own field on
 *   draOptObj[class], read and written by OptMatCom throughout.
 *
 * - `labStr` (String): Label String is the row's own visible setting
 *   name, rendered by OptMatCom as the row's own leading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REM_MAT_ARR : { dynFun : ( oncEnaBoo : boolean, reuEnaBoo : boolean ) => React.JSX.Element, keyStr : keyof RemClaTyp, labStr : string }[] = [ // What: Reminder Matrix Array. Why: OptMatCom needs one row per participation setting, each pivoted across the once/recurring classes. How: This is mapped over in OptMatCom's JSX to render one matrix row per entry.


	{ // What: Streak Row Entry. Why: Whether a class counts toward the Today page's own day streak is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the day streak in the Today page', 'nor' ),
		keyStr : 'streak',
		labStr : 'Counts toward day streak'


	},

	{ // What: Ring Row Entry. Why: Whether a class counts toward the Today page's own completion ring is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the completion ring in the Today page', 'nor' ),
		keyStr : 'ring',
		labStr : 'Include in completion ring'


	},

	{ // What: Exclude Weekends Row Entry. Why: Whether a class is excluded from the Today page on weekends is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on weekends', 'nor' ),
		keyStr : 'excludeWeekends',
		labStr : 'Exclude on weekends'


	},

	{ // What: Exclude Holidays Row Entry. Why: Whether a class is excluded from the Today page on holidays is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on holidays', 'nor' ),
		keyStr : 'excludeHolidays',
		labStr : 'Exclude on holidays'


	},

	{ // What: Stats Row Entry. Why: Whether a class's own statistics show in the Stats page is its own independent participation setting. How: This entry's own dynFun (written directly, not via paiSubFun) explains which classes currently show.


		keyStr : 'stats',
		labStr : 'Include in Stats',

		dynFun : ( oncEnaBoo : boolean, reuEnaBoo : boolean ) => ( // What: Dynamic Function. Why: This row's own sub-explanation needs custom wording ("statistics") rather than paiSubFun's own generic verb phrasing, so it's written out directly instead of reusing paiSubFun. How: OptMatCom calls this with the live once/recurring toggle states.


			oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes shows statistics. How: This tests both flags first.
				? <><strong>both</strong> one-time and recurring item statistics will be shown in the Stats page</>    // What: Both Phrase. Why: Both classes show statistics. How: This names both item kinds.
				: oncEnaBoo                                                                                            // What: Once-Only Check. Why: Only one class may show statistics. How: This tests the one-time flag next.
				? <><strong>only</strong> one-time item statistics will be shown in the Stats page</>                  // What: Once-Only Phrase. Why: Only one-time statistics show. How: This names only one-time items.
				: reuEnaBoo                                                                                            // What: Recurring-Only Check. Why: The recurring class may be the only one shown. How: This tests the recurring flag last.
				? <><strong>only</strong> recurring item statistics will be shown in the Stats page</>                 // What: Recurring-Only Phrase. Why: Only recurring statistics show. How: This names only recurring items.
				: <><strong>neither</strong> one-time nor recurring item statistics will be shown in the Stats page</> // What: Neither Phrase. Why: Neither class shows statistics. How: This names neither item kind.


		)


	}


];

// #endregion REM_MAT_ARR

// #endregion Helpers



// #region Components

type OmcProTyp = { actStoObj : ActStoTyp, onCloConFun : () => void, remOptObj : RemOptTyp }; // What: Option-Matrix-Component Props Type. Why: The participation matrix edits both reminder classes' switches and closes its Controls body. How: This types OptMatCom's props.

// #region OptMatCom

/**
 * OptMatCom = Options Matrix Component
 *
 * @summary
 * Data tab: the Reminders Controls body, the participation matrix.
 * Rendered only while the Controls disclosure is open. Every toggle
 * edits a local draft: Cancel drops it, while Save, or the body closing
 * any other way, commits the changed toggles. Mirrors the picker
 * Controls' own Cancel/Save (no Delete, since these are global
 * settings).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared actions bag.
 * @param props.onCloConFun - On Close Control Function: Collapses this
 *                            Controls body, called by both Cancel and Save.
 * @param props.remOptObj   - Reminder Option Object: The live { once,
 *                            recurring } participation options object.
 *
 * @returns The full participation matrix: its head row, one row per
 * REM_MAT_ARR entry, and its own Cancel/Save foot.
 *
 * @example
 * ```tsx
 * OptMatCom({ actStoObj, onCloConFun, remOptObj }) // => <OptMatCom />
 * ```
 *
*/

function OptMatCom ( { actStoObj, onCloConFun, remOptObj } : OmcProTyp ) : React.JSX.Element {


	const [ draOptObj, setDraOptObj ] = React.useState( () => ( { // What: Draft Options Object And Setter. Why: Every toggle edits this local copy, so nothing reaches the settings until the matrix is saved or closed. How: This starts as a copy of both classes' options.


		once      : { ...remOptObj.once },     // What: Once. Why: The one-time class's toggles need their own editable copy. How: This shallow-copies remOptObj.once.
		recurring : { ...remOptObj.recurring } // What: Recurring. Why: The recurring class's toggles need their own editable copy. How: This shallow-copies remOptObj.recurring.


	} ) );


	const hanCloRef = React.useRef( false ); // What: Handled Close Reference. Why: A matrix already saved or cancelled must not commit again when it unmounts. How: This flips true on either.


	// #region comOptFun

	/**
	 * comOptFun = Commit Options Function
	 *
	 * @summary
	 * Commits the matrix's draft, once: every toggle that differs from the live
	 * settings is written through setOptFun. Does nothing for a matrix already
	 * saved or cancelled.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * comOptFun() // => void
	 * ```
	 *
	*/

	const comOptFun = () => { // What: Commit Options Function. Why: Saving or closing the matrix keeps its toggles. How: This writes every changed toggle through setOptFun, once.


		if ( hanCloRef.current ) return; // What: Handled Close Guard. Why: A saved or cancelled matrix has nothing left to commit. How: This bails out once hanCloRef is set.



		hanCloRef.current = true; // What: Handled Close Mark. Why: Any later unmount must not commit twice. How: This flips hanCloRef.



		( [ 'once', 'recurring' ] as const ).forEach( ( tasClaStr ) => ( Object.keys( draOptObj[ tasClaStr ] ) as ( keyof RemClaTyp )[] ).forEach( ( optKeyStr ) => { if ( !!draOptObj[ tasClaStr ][ optKeyStr ] !== !!remOptObj[ tasClaStr ][ optKeyStr ] ) actStoObj.setOptFun( tasClaStr, optKeyStr, draOptObj[ tasClaStr ][ optKeyStr ] ); } ) ); // What: Changed Toggles Loop. Why: Only toggles the user actually changed are written. How: This calls setOptFun for every class/setting pair whose draft differs from the live setting. // What: Type Assertion Note. Why: A plain list of names, and the keys Object.keys returns, are both typed as plain strings. How: The class names are held as a constant tuple and each setting key is read as a RemClaTyp key, since both come straight from the reminder options' own shape.


	};

	// #endregion comOptFun


	const canMatFun = () => { // What: Cancel Matrix Function. Why: Cancel drops the draft and closes the body. How: This marks the close handled, then collapses the body.


		hanCloRef.current = true; // What: Handled Close Mark. Why: The unmount must not commit a draft Cancel dropped. How: This flips hanCloRef.

		onCloConFun(); // What: Controls Close Call. Why: A cancelled matrix has nothing left to show. How: This collapses the Controls body.


	};


	const savMatFun = () => { // What: Save Matrix Function. Why: Save keeps the draft and closes the body. How: This commits the draft, then collapses the body.


		comOptFun(); // What: Commit Options Call. Why: Save keeps every toggle. How: This calls comOptFun.

		onCloConFun(); // What: Controls Close Call. Why: A saved matrix has nothing left to show. How: This collapses the Controls body.


	};



	return (


		<div
			className={ cssModObj.remMatDiv }

			data-element-name-hook='remMatDiv'
		>{ /* What: Matrix Div Element. Why: This is OptMatCom's own root element. How: This renders the head row, one row per REM_MAT_ARR entry, and the foot below. Its data-element-name-hook is read by help mode's Data catalog. */ }


			<div className={ cssModObj.matHeaDiv }>{ /* What: Matrix Header Div Element. Why: The 2 column labels need their own header row above the data rows. How: This renders an empty leading cell (aligning with each row's own name column) plus the 2 column-label spans. */ }


				<span></span>{ /* What: Matrix Head Spacer Span Element. Why: This aligns the head row's own 2 column labels under the data rows' own switch cells, leaving the name column's own header cell blank. How: This renders an empty span. */ }

				<span className={ cssModObj.matColSpa }>One-time</span>{ /* What: Matrix Column Span Element. Why: This labels the first switch column. How: This renders the literal text "One-time". */ }

				<span className={ cssModObj.matColSpa }>Recurring</span>{ /* What: Matrix Column Span Element. Why: This labels the second switch column. How: This renders the literal text "Recurring". */ }


			</div>

			{ REM_MAT_ARR.map( ( optDefObj ) => ( // What: Matrix Row List Render. Why: One row is needed per participation setting. How: This maps REM_MAT_ARR to one row div per entry, keyed by its own key.


				<div
					key={ optDefObj.keyStr }

					className={ cssModObj.matRowDiv }
				>{ /* What: Matrix Row Div Element. Why: One setting's own name/sub-explanation and both switch cells need to sit together as one row. How: This renders the name span, then maps the 2 classes into their own switch cells below. */ }


					<span className={ cssModObj.matNamSpa }>{ /* What: Matrix Name Span Element. Why: The plain label and its own live sub-explanation read together as one unit. How: This renders optDefObj's own label, then its dynFun's live result. */ }


						{ optDefObj.labStr }{ /* What: Matrix Name Render. Why: This is the row's own plain, static setting name. How: This renders optDefObj's own labStr directly as text. */ }

						<span
							key={ ( draOptObj.once[ optDefObj.keyStr ] ? 1 : 0 ) + '' + ( draOptObj.recurring[ optDefObj.keyStr ] ? 1 : 0 ) } // What: Toggle State Key. Why: The explanation should re-fade only when either class's toggle for this row flips. How: This joins the two toggle states into one key.

							className={ cssModObj.matSubSpa }
						>{ optDefObj.dynFun( !!draOptObj.once[ optDefObj.keyStr ], !!draOptObj.recurring[ optDefObj.keyStr ] ) }</span>{ /* What: Dynamic Sub Span Element. Why: Every row needs its own live, re-fading explanation. How: This re-keys on the combined once/recurring toggle state and calls optDefObj's own dynFun. */ }


					</span>

					{ ( [ 'once', 'recurring' ] as const ).map( ( tasClaStr ) => { // What: Switch Cell List Render. Why: Every row needs exactly 2 switch cells, one per participation class. How: This maps the 2 literal class keys to one switch cell each. // What: Type Assertion Note. Why: Each class name indexes the draft options. How: The two names are read as a constant tuple so each one is a real class key.


						const swtEnaBoo = !!draOptObj[ tasClaStr ][ optDefObj.keyStr ]; // What: Switch Enabled Boolean. Why: Each cell's own switch needs to know whether this specific class/setting pair is currently on. How: This reads draOptObj indexed first by tasClaStr, then by optDefObj's own keyStr.



						return (


							<span
								key={ tasClaStr }

								className={ cssModObj.matCelSpa }
							>{ /* What: Matrix Cell Span Element. Why: Each switch needs its own cell wrapper for layout. How: This wraps the single switch button below. */ }


								<button
									className={ cssModObj.togSwiBut }

									data-element-name-hook='togSwiBut'

									aria-label={ `${ tasClaStr === 'once' ? 'One-time' : 'Recurring' }: ${ optDefObj.labStr }` } // What: Switch Label Pick. Why: Each switch's accessible name must say which class and setting it controls. How: This joins the class name with the row's own label.
									aria-pressed={ swtEnaBoo }

									onClick={ () => setDraOptObj( ( preOptObj ) => ( { // What: On Click Handler. Why: A toggle changes the draft, not the live settings. How: This flips this class/setting pair in draOptObj.


										...preOptObj, // What: Previous Options Spread. Why: The other class's toggles must carry over unchanged. How: This spreads preOptObj first, so only this class is overridden.

										[ tasClaStr ] : { // What: Task Class String Key. Why: Only this class's own toggles change. How: This rebuilds the class's options with the one flipped setting below.


											...preOptObj[ tasClaStr ], // What: Previous Class Options Spread. Why: This class's other settings must carry over unchanged. How: This spreads the class's current options first.

											[ optDefObj.keyStr ] : !swtEnaBoo // What: Option Definition Key String Key. Why: This is the one setting the switch controls. How: This sets it to the opposite of swtEnaBoo.


										}


									} ) ) }
								>{ /* What: Switch Button Element. Why: This is the actual toggle for this class/setting pair. How: This flips this pair in the matrix's draft. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


									<i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: The switch's own CSS-driven thumb needs a real (if empty) element to animate. How: This renders an empty, purely decorative i element. */ }


								</button>


							</span>


						);


					} ) }


				</div>


			) ) }


			<div
				className={ cssModObj.matFooDiv }

				data-element-name-hook='matFooDiv'
			>{ /* What: Matrix Foot Div Element. Why: The Cancel/Save actions need their own row below every matrix row. How: This wraps the fooRigDiv div below. Its data-element-name-hook is read by help mode's Data catalog. */ }


				<div className={ cssModObj.fooRigDiv }>{ /* What: Footer Right Div Element. Why: Cancel and Save read as a pair, right-aligned. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ canMatFun }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This drops every toggle changed since this component mounted. How: This calls canMatFun. */ }



					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ savMatFun }
					>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps every toggle changed since this component mounted. How: This calls savMatFun. */ }


				</div>


			</div>



			<UnmWatCom onUnmWatFun={ comOptFun } />{ /* What: Unmount Watcher Component. Why: A matrix closed without Save (collapsing Controls or the Reminders card, a tab switch) still keeps its toggles. How: This calls comOptFun when the matrix unmounts, which skips one already saved or cancelled. */ }


		</div>


	);


}

// #endregion OptMatCom



type RmcProTyp = { actStoObj : ActStoTyp, staAppObj : StaAppTyp }; // What: Reminder-Manager-Component Props Type. Why: The Reminders section reads the saved reminders and changes them through the store. How: This types RemManCom's props.

// #region RemManCom

/**
 * RemManCom = Reminder Manager Component
 *
 * @summary
 * The Data tab's full reminder management: a collapsible category holding the
 * participation Controls (OptMatCom) and the sortable Items list, where each
 * row expands into the same schedule editor and footer Today uses, editing a
 * local draft that's kept when the row saves or closes and dropped on Cancel.
 * Rendered by tab-data.tsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: The shared app actions that
 *                          mutate props.staAppObj.
 * @param props.staAppObj - State App Object: The entire app's own persisted
 *                          state.
 *
 * @returns The Reminders category: its header, the Controls
 * disclosure (OptMatCom), and the Items disclosure (one row per
 * reminder, expanding into SchEdiCom plus EdiFooCom).
 *
 * @example
 * ```tsx
 * RemManCom({ actStoObj, staAppObj }) // => <RemManCom />
 * ```
 *
*/

function RemManCom ( { actStoObj, staAppObj } : RmcProTyp ) : React.JSX.Element {


	// #region Open Row Tracking

	const [ opeIdeStr, setOpeIdeStr ] = React.useState< string | null >( null );    // What: Open Identifier String And Setter. Why: This tracks which reminder's own row is currently expanded into its editor. How: This is compared against each row's own id throughout the render below.
	const [ insIdeStr, setInsIdeStr ] = React.useState< string | null >( null );    // What: Insert Identifier String And Setter. Why: A just-inserted reminder row needs to play its own slide-in entrance exactly once. How: This is set right when a row is created or an editor closes, cleared on that row's own animation end.
	const [ newTasObj, setNewTasObj ] = React.useState< TasRcdTyp | null >( null ); // What: New Task Object And Setter. Why: A brand-new reminder stays a local draft, out of the store and storage, until it's kept. How: This holds that reminder, built with TAS_NAM_OBJ.defTasFun's defaults, or null when none is being added.

	const newAddRef = React.useRef< string | null >( null );                               // What: New Added Reference. Why: A reminder just created via "New reminder" hasn't been kept yet; Cancel on such an item discards the whole add rather than keeping it. How: This holds that reminder's own id until it's kept or discarded.
	const froIndRef = React.useRef< { ideVal : string, indNum : number } | null >( null ); // What: Frozen Index Reference. Why: freEdiFun needs a place to remember whichever reminder's own render position is currently frozen. How: This is passed straight through to freEdiFun below.
	const preOpeRef = React.useRef< string | null >( null );                               // What: Previous Open Reference. Why: The effect right below needs opeIdeStr's own PRIOR value to detect a genuine close, not just its current value. How: This is read and overwritten at the end of that same effect.
	const opeRowRef = React.useRef< HTMLDivElement | null >( null );                       // What: Open Row Reference. Why: A brand-new reminder's own "+ New reminder" click needs to scroll the resulting form into view, since it opens pinned below the sort control rather than guaranteed to already be on-screen. How: This is attached only to the currently-open row's own DOM node, via its ref prop below.
	const focInpRef = React.useRef< HTMLInputElement | null >( null );                     // What: Focus Input Reference. Why: The open row's own name input focuses itself via a ref callback below instead of plain autoFocus, suppressing the browser's own instant focus-scroll so it doesn't fight the deliberate smooth scroll above. How: This is attached via that input's own ref callback in the render below.


	React.useEffect( () => { // What: Replay Insert Effect. Why: Whichever reminder's own editor just closed (Save, Cancel, delete, or the row's own collapse chevron) should replay the insert entrance once it settles into its (possibly new, now-unfrozen) sorted position, instead of silently snapping there. How: This detects an opeIdeStr transition away from a real id, then stages that id as insIdeStr.


		const preOpeStr = preOpeRef.current; // What: Previous Open String. Why: This is compared against opeIdeStr below to detect the exact close transition. How: This reads preOpeRef's own remembered prior value.


		if ( preOpeStr != null && preOpeStr !== opeIdeStr ) setInsIdeStr( preOpeStr ); // What: Close Transition Guard. Why: Only a genuine "was open, now isn't (or moved to a different row)" transition should replay the insert entrance. How: This stages preOpeStr as insIdeStr only when both conditions hold.



		preOpeRef.current = opeIdeStr; // What: Previous Open Snapshot Update. Why: The next run of this effect needs to compare against whatever opeIdeStr is right now. How: This overwrites preOpeRef with opeIdeStr's own current value.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact transition it watches for. How: opeIdeStr is compared against preOpeRef's own remembered prior value every run.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: Only a BRAND-NEW reminder's own editor opening should auto-scroll; reopening an existing reminder's editor should not yank the viewport. How: This guards on newAddRef still matching opeIdeStr, then scrolls opeRowRef's own current node into view, waiting for the ColDisCom open animation to finish first (unless reduced motion).


		const notOpeBoo = !opeIdeStr;                      // What: Not Open Boolean. Why: No row is open, so there is nothing to scroll to. How: This negates opeIdeStr.
		const notNewBoo = newAddRef.current !== opeIdeStr; // What: Not New Boolean. Why: Reopening an existing reminder must not scroll. How: This checks newAddRef's own current id doesn't match opeIdeStr.
		const notRowBoo = !opeRowRef.current;              // What: Not Row Boolean. Why: The row's node must be mounted before it can scroll. How: This negates opeRowRef.current.

		const skiScrBoo = notOpeBoo || notNewBoo || notRowBoo; // What: Skip Scroll Boolean. Why: Any one missing piece means this effect has nothing to do. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: Not-A-New-Open Guard. Why: Every other case (no row open, a re-opened existing row, or the ref not yet attached) should do nothing at all. How: This bails out unless all 3 conditions hold.



		const rowCurEle = opeRowRef.current!; // What: Row Current Element. Why: This gives a stable local reference to the live row DOM node for this scroll pass. How: This is read once from opeRowRef.current and reused below. // What: Non-Null Note. Why: The skip guard above already returned when the row wasn't mounted. How: The ! tells TypeScript the row is set here.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant scroll instead of a smooth, timed one. How: This scrolls instantly and returns early when redMotFun reports true.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), durMilFun( 'p02' ) ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (see .colDisDiv in ui/collapse.module.css) needs to finish growing the editor below the row header before scrolling, or the scroll target would still be moving. How: This waits that animation's own p02 duration step, then scrolls smoothly. // Duration Base Plus 2 ~= 277.0ms



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A pending scroll must not fire after this effect re-runs or the component unmounts. How: This clears scrTimNum.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact condition its own guard checks. How: opeIdeStr is read directly inside the effect body above.



	const opeTasObj = !opeIdeStr // What: Open Task Object. Why: The open row's draft is a copy of either the local new reminder or a stored one. How: This resolves the open id to whichever of the two it names, or null.
		? null                                                                                   // What: Nothing Open Branch. Why: With no row open there's nothing to copy. How: This is null.
		: newTasObj && newTasObj.id === opeIdeStr                                                // What: New Reminder Check. Why: The local new reminder isn't in the store yet. How: This tests whether it's the open one.
		? newTasObj                                                                              // What: New Reminder Branch. Why: The new reminder's draft starts from the local reminder. How: This is newTasObj.
		: ( staAppObj.tasks || [] ).find( ( curTasObj ) => curTasObj.id === opeIdeStr ) || null; // What: Stored Reminder Branch. Why: Any other open row is a stored reminder. How: This looks the open id up in the store, or null.


	const { comDraFun, draTasObj, patDraFun } = useTasDraFun( actStoObj, opeTasObj ); // What: Task Draft Destructure. Why: The open row's name input and schedule editor both edit one local draft, committed when the row closes or saves. How: This calls useTasDraFun with the open reminder.

	const hanDraRef = React.useRef< TasRcdTyp | null >( null ); // What: Handled Draft Reference. Why: A draft that was already saved or cancelled must not be committed again when its row unmounts afterward. How: This holds the last draft object keeTasFun committed or Cancel dropped.


	// #region keeTasFun

	/**
	 * keeTasFun = Keep Task Function
	 *
	 * @summary
	 * Commits the open row's draft, once. A brand-new reminder is added to the
	 * store as drafted (addTasFun de-duplicates its name, an emptied one falling
	 * back to the default), while any other reminder commits only its changed
	 * fields. Does nothing when no row is open or this exact draft was already
	 * committed or cancelled.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * keeTasFun() // => void
	 * ```
	 *
	*/

	const keeTasFun = () => { // What: Keep Task Function. Why: Saving, collapsing, or otherwise closing a reminder row keeps its edits. How: This adds a new reminder as drafted, or commits a stored one's changed fields, skipping a draft already handled.


		if ( !draTasObj || hanDraRef.current === draTasObj ) return; // What: Handled Draft Guard. Why: There's nothing to keep without a draft, or once this draft was already saved or cancelled. How: This bails out in either case.



		hanDraRef.current = draTasObj; // What: Handled Draft Mark. Why: Any later close of this same draft must not commit it twice. How: This records the draft being committed.



		if ( newTasObj && newTasObj.id === draTasObj.id ) { // What: New Reminder Guard. Why: A brand-new reminder joins the store as drafted. How: This adds the draft and clears the local new reminder.


			actStoObj.addTasFun({ // What: Add Task Call. Why: This is the moment the new reminder actually joins the app. How: This adds the draft under its own id, keeping the default name when the drafted one is blank.


				...draTasObj, // What: Draft Task Spread. Why: Every drafted field, id included, must join the store as drafted. How: This spreads draTasObj first, so only the name below is overridden.

				name : draTasObj.name.trim() || newTasObj.name // What: Name. Why: A saved reminder never keeps stray spaces or a blank name. How: This trims the drafted name, falling back to the new reminder's default name.


			});

			newAddRef.current = null; // What: New-Item Flag Clear. Why: A kept reminder is no longer new. How: This clears newAddRef.

			setNewTasObj( null ); // What: New Task Object Clear. Why: The store now holds this reminder. How: This clears newTasObj.


		}

		else comDraFun(); // What: Commit Draft Branch. Why: A stored reminder's edits must reach it. How: This calls comDraFun.


	};

	// #endregion keeTasFun


	// #region cloTasFun

	/**
	 * cloTasFun = Close Task Function
	 *
	 * @summary
	 * Closes the open row the way its own collapse chevron does: its draft is
	 * kept, then the row closes. Used by the open row's UnmWatCom, so a row
	 * that disappears some other way (the Reminders card or its Items section
	 * collapsing, a tab switch) also keeps its edits.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cloTasFun() // => void
	 * ```
	 *
	*/

	const cloTasFun = () => { // What: Close Task Function. Why: A row that disappears keeps its edits the same way its own collapse chevron does. How: This keeps the open draft, then closes the row.


		keeTasFun(); // What: Keep Task Call. Why: Closing keeps the draft. How: This calls keeTasFun.

		setOpeIdeStr( null ); // What: Open Row Clear. Why: No row stays open. How: This resets opeIdeStr to null.


	};

	// #endregion cloTasFun

	// #endregion Open Row Tracking



	// #region Items List Order

	const visTasArr = [ ...( staAppObj.tasks || [] ).filter( ( curTasObj ) => !curTasObj.hidden ), ...( newTasObj ? [ newTasObj ] : [] ) ]; // What: Visible Task Array. Why: A hidden (mini-tour-linked) task must never appear in the Data tab's own list, while a new reminder still being drafted must. How: This filters out hidden tasks, then adds the local new reminder when there is one.
	const iteSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort.reminders ) || 'name-asc';                           // What: Item Sort String. Why: The Items list's own sort needs a persisted, defaulted value to drive both the sort control and the comparator below. How: This reads staAppObj's own ui.dataSort.reminders, falling back to 'name-asc'.


	const tasDatMap = new Map( visTasArr.map( ( curTasObj ) => { // What: Task Date Map. Why: TAS_NAM_OBJ.nexEliFun can walk up to ~3 years of days per call; computing every task's own next date once up front (rather than inside the comparator below, which runs it on every comparison) avoids doing that work redundantly. How: This maps each visible task to a [id, time] pair.


		const nexEliObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Next Eligible Object. Why: This is the actual date sorEntFun sorts by for the date-asc/date-desc options. How: This calls TAS_NAM_OBJ.nexEliFun against curTasObj.



		return [ curTasObj.id, nexEliObj ? nexEliObj.getTime() : null ]; // What: Task Date Pair Return. Why: A Map needs a real, comparable numeric time (or null for "no next occurrence"), not a Date instance. How: This pairs curTasObj's own id with nexEliObj's own getTime(), or null when there's no next occurrence at all.


	} ) );


	const sorTasArr = [ ...visTasArr ].sort( ( tasOneObj, tasTwoObj ) => sorEntFun( // What: Sorted Task Array. Why: This is the Items list's own actual render order. How: This sorts a copy of visTasArr via sorEntFun, fed each side's own name/type/date shape and iteSorStr.


		{ // What: Row One Object. Why: sorEntFun needs a comparable shape for the left-hand side of this comparison. How: This builds it from tasOneObj, with every field this shape doesn't use left null.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasOneObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasOneObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasOneObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasOneObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasOneObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		{ // What: Row Two Object. Why: sorEntFun needs a comparable shape for the right-hand side of this comparison. How: This builds it from tasTwoObj, mirroring Row One Object's own shape.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasTwoObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasTwoObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasTwoObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasTwoObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasTwoObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		iteSorStr // What: Item Sort String Argument. Why: sorEntFun needs the section's chosen sort key and direction. How: This passes the current sort selection.


	) );


	const disTasArr = freEdiFun( sorTasArr, opeIdeStr, newAddRef.current, froIndRef ); // What: Display Task Array. Why: The open editor's own row must not visibly reorder out from under it as its own fields change. How: This calls freEdiFun against sorTasArr, opeIdeStr, and newAddRef's own current value.

	// #endregion Items List Order



	// #region Category State

	const colMaiMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Main Map. Why: The main section's own collapse state persists (like the pickers), so it survives tab switches. How: This reads staAppObj's own ui.controlsCollapsed, falling back to an empty object.
	const secOpeBoo = colMaiMap[ '__reminders_main' ] === false;                // What: Section Open Boolean. Why: This reserved key defaults COLLAPSED, so absent means collapsed and an explicit false means expanded. How: This checks colMaiMap's own '__reminders_main' entry against exactly false.
	const togMaiFun = () => actStoObj.togColFun( '__reminders_main', true );    // What: Toggle Main Function. Why: The header's own clickable area needs a single call to flip the main section's own collapse staAppObj. How: This calls actStoObj.togColFun against the same reserved key.

	const colSubMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Sub Map. Why: The Controls and Items sub-panels each remember their own collapse state independently of the main section and of each other. How: This reads the same staAppObj's own ui.controlsCollapsed, kept as a separate read for its own 2 sub-keys below.
	const conColBoo = !!colSubMap[ '__reminders' ];                             // What: Controls Collapsed Boolean. Why: The Controls disclosure defaults OPEN, so absent means open. How: This checks colSubMap's own '__reminders' entry.
	const iteColBoo = !!colSubMap[ '__reminders:items' ];                       // What: Items Collapsed Boolean. Why: The Items disclosure likewise defaults open. How: This checks colSubMap's own '__reminders:items' entry.

	const norOptObj = TAS_NAM_OBJ.norOptFun( staAppObj.reminderOpts ); // What: Normalized Options Object. Why: OptMatCom needs a fully-shaped { once, recurring } object even from an older or partial saved staAppObj. How: This calls TAS_NAM_OBJ.norOptFun against staAppObj's own reminderOpts.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj );              // What: Tutorial Progress Boolean. Why: "New reminder" is a second, independent path to a real reminder, reachable from this page, and must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This calls ONB_CHE_OBJ.tutProFun against staAppObj.

	// #endregion Category State



	// #region Row Actions

	const kepCloFun = ( tasIdeStr : string ) => { // What: Keep Close Function. Why: The row's own collapse chevron AND EdiFooCom's own Save mean "keep this, I'm done", and both need the exact same cleanup so the chevron can't drift out of sync with what Save already does. How: This keeps the open draft, then closes the row only while it's still this exact one.


		keeTasFun(); // What: Keep Task Call. Why: The collapse chevron and Save both keep the row's edits. How: This commits the open draft, adding a brand-new reminder to the store first.

		setOpeIdeStr( ( curOpeStr ) => curOpeStr === tasIdeStr ? null : curOpeStr ); // What: Open Row Close Call. Why: This is the actual collapse, closing the row only while it's still this exact one that was open. How: This clears opeIdeStr only while it still matches tasIdeStr.


	};


	const addEdiFun = () => { // What: Add Edit Function. Why: "New reminder" needs to start a local draft reminder AND immediately open its own editor, ensuring the main section is open too. How: This keeps any open row, builds the draft, then opens its row.


		if ( newAddRef.current ) return; // What: Guard: Ignore Rapid Double-Click. Why: A second "New reminder" click while the first add hasn't been kept yet would spawn a stray extra reminder. How: This bails out while newAddRef already holds an id.



		keeTasFun(); // What: Keep Task Call. Why: A row left open when a new reminder starts is closing, and closing keeps its edits. How: This calls keeTasFun, which does nothing when no row is open.



		const buiTasObj = TAS_NAM_OBJ.defTasFun( { name : 'New reminder', repeat : 'once' } ); // What: Built Task Object. Why: A new reminder starts as a local draft with the same defaults the store would give it. How: This builds a one-time reminder named 'New reminder' with a fresh id.


		newAddRef.current = buiTasObj.id; // What: New-Item Flag Set. Why: The freshly-created row needs to know it's "new" for its own isaNewBoo prop. How: This sets newAddRef to its id.

		setNewTasObj( buiTasObj );    // What: New Task Set Call. Why: The row renders from this local reminder until it's kept. How: This stores buiTasObj in newTasObj.
		setInsIdeStr( buiTasObj.id ); // What: Insert Identifier Stage Call. Why: The new row needs to play its own entrance animation exactly once. How: This sets insIdeStr to the new id.
		setOpeIdeStr( buiTasObj.id ); // What: Open Row Stage Call. Why: The new reminder's own editor should open immediately so the user can fill it in. How: This sets opeIdeStr to the new id.

		if ( !secOpeBoo ) actStoObj.togColFun( '__reminders_main', true ); // What: Main Section Expand Guard. Why: The newly-open editor must actually be visible, which requires the main section itself to be expanded. How: This expands the main section only while it was collapsed.


	};

	// #endregion Row Actions



	return (


		<section
			className={ cssModObj.datCatSec }

			data-element-name-hook='datCatSec remCatSec'
		>{ /* What: Category Section Element. Why: This is RemManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the ColDisCom-wrapped body below. Its data-element-name-hook is read by the App Features tours, the Data page tour, and help mode's Data catalog. */ }


			<header
				className={ cssModObj.catHeaHea }

				data-element-name-hook='catHeaHea'
			>{ /* What: Category Header Element. Why: The whole header is one clickable disclosure toggling the main section. How: This wraps the single toggle button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


				<button
					className={ cssModObj.catHeaBut }

					data-element-name-hook='catHeaBut'

					type='button'

					aria-expanded={ secOpeBoo }

					onClick={ togMaiFun }
				>{ /* What: Category Header Button Element. Why: This is the actual clickable disclosure control for the whole category. How: This toggles secOpeBoo via togMaiFun. Its data-element-name-hook is read by the App Features tours. */ }


					<span
						className={ cssModObj.chvDisSpa }

						data-chevron-open-active={ secOpeBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while secOpeBoo is true.
					>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates the disclosure's open/closed state. How: This rotates via data-chevron-open-active while secOpeBoo is true. */ }


						<IcoSvgCom
							icoNamStr='chvEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the whole section's own disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at the bas rhythm step. */ }


					</span>

					<span className={ cssModObj.catMaiSpa }>{ /* What: Category Main Span Element. Why: The name and count read together as one unit, distinct from the chevron beside them. How: This wraps the heading and the count span below. */ }


						<h2 className={ cssModObj.catNamHea }>Reminders</h2>{ /* What: Category Name Heading Element. Why: This is the category's own fixed title. How: This renders the literal text "Reminders". */ }

						<span className={ cssModObj.catCouSpa }>{ /* What: Category Count Span Element. Why: Reminders have no active/inactive concept yet (unlike pickers' eligible-of-total and Conditionals' active-of-total), so both numbers are the same for now, kept in this "N of N" shape for visual consistency and in case that changes later. How: This wraps 2 identical count spans and the literal word "of" between them. */ }


							<span>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: Reminders have no active/inactive split yet, so this same number stands in for both halves of the "N of N" shape. How: This renders visTasArr's own length. */ }

							<span>of</span>{ /* What: Category Count Of Span Element. Why: This joins the two count numbers into one readable "N of N" phrase. How: This renders the literal text "of". */ }

							<span>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: See the leading count span's own comment above; this is its mirrored second half. How: This renders visTasArr's own length again. */ }


						</span>


					</span>


				</button>


			</header>



			<ColDisCom open={ secOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The entire body below only exists while the category itself is expanded. How: This animates catBodDiv open/closed based on secOpeBoo. */ }


				<div
					className={ cssModObj.catBodDiv }

					data-element-name-hook='catBodDiv'
				>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures need to sit together as one scrollable body. How: This renders both disclosure toggles and their own ColDisCom-wrapped content below. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


					<button
						className={ cssModObj.catTogBut }

						data-element-name-hook='catTogBut'

						type='button'

						aria-expanded={ !conColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders' ) }
					>{ /* What: Controls Disclosure Button Element. Why: Controls is a nested collapsible, open by default, remembered per section. How: This toggles conColBoo via actStoObj.togColFun. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


						<span className={ cssModObj.togLabSpa }>{ /* What: Controls Toggle Label Span Element. Why: The chevron and the "Controls" kicker read together as one unit. How: This wraps both below. */ }


							<span
								className={ cssModObj.chvDisSpa }

								data-chevron-open-active={ !conColBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while !conColBoo is true.
							>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Controls is currently open (note the inverted sense: open while NOT collapsed). How: This rotates via data-chevron-open-active while conColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizSteStr='m01' // Vertical Rhythm Base Minus 1 = 11px
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at the m01 rhythm step. */ }


							</span>

							<span className={ cssModObj.togKicSpa }>Controls</span>{ /* What: Toggle Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Controls". */ }


						</span>

						{ conColBoo && <span className={ cssModObj.togSumSpa }>{ REM_MAT_ARR.length } settings</span> }{ /* What: Controls Summary Span Element. Why: A collapsed disclosure still needs a hint of how much content it's hiding. How: This renders REM_MAT_ARR's own length only while conColBoo is true. */ }


					</button>



					<ColDisCom open={ !conColBoo }>{ /* What: Collapse Disclosure Component. Why: OptMatCom's own matrix only exists while the Controls disclosure is open. How: This animates OptMatCom open/closed based on conColBoo. */ }


						<OptMatCom
							actStoObj={ actStoObj }
							remOptObj={ norOptObj }

							onCloConFun={ () => actStoObj.togColFun( '__reminders' ) }
						/>{ /* What: Option Matrix Component. Why: This is the actual once/recurring participation matrix, editing the normalized reminderOpts shape. How: This closes back via onCloConFun, collapsing the Controls disclosure above. */ }


					</ColDisCom>



					<button
						className={ cssModObj.catTogBut }

						data-element-name-hook='catTogBut'

						type='button'

						aria-expanded={ !iteColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders:items' ) }
					>{ /* What: Items Disclosure Button Element. Why: Items is the same kind of nested collapsible as Controls, independently remembered. How: This toggles iteColBoo via actStoObj.togColFun. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


						<span className={ cssModObj.togLabSpa }>{ /* What: Items Toggle Label Span Element. Why: The chevron and the "Items" kicker read together as one unit. How: This wraps both below. */ }


							<span
								className={ cssModObj.chvDisSpa }

								data-chevron-open-active={ !iteColBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while !iteColBoo is true.
							>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Items is currently open. How: This rotates via data-chevron-open-active while iteColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizSteStr='m01' // Vertical Rhythm Base Minus 1 = 11px
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at the m01 rhythm step. */ }


							</span>

							<span className={ cssModObj.togKicSpa }>Items</span>{ /* What: Toggle Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Items". */ }


						</span>

						{ iteColBoo && <span className={ cssModObj.togSumSpa }>{ visTasArr.length } items</span> }{ /* What: Items Summary Span Element. Why: A collapsed disclosure still needs a hint of how many reminders it's hiding. How: This renders visTasArr's own length only while iteColBoo is true. */ }


					</button>



					<ColDisCom open={ !iteColBoo }>{ /* What: Collapse Disclosure Component. Why: The whole Items list (full-bleed rows: type icon + name + schedule, expanding into the exact Today editor) only exists while this disclosure is open. How: This animates the fragment below open/closed based on iteColBoo. */ }


						<React.Fragment>{ /* What: Items Fragment Element. Why: The add button and the list/empty-state below need to sit together with no extra dom wrapper of their own. How: This groups both below as one returned value. */ }


							{ tutProBoo ? ( // What: Tutorials In Progress Check. Why: This second add-reminder entry point must also stay disabled with an explanation while the guided checklist is running. How: This renders the disabled InfTipCom while tutProBoo is true, the real button otherwise.


								<InfTipCom
									className={ cssModObj.rowAddSpa }

									data-element-name-hook='rowAddSpa'
									data-tour-disabled-active // What: Tour Disabled Active Attribute. Why: This add control only renders while the tutorials hold it disabled, so it always reads dimmed. How: This sets the presence-only attribute, which InfTipCom forwards to its trigger.

									actNamStr='New reminder'
									labTexStr='This button is disabled until all tutorials are completed.'
								>{ /* What: Info Tip Component. Why: This is a second, independent path to a real reminder, so it must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This wraps the plus icon and label text, standing in for the real button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</InfTipCom>


							) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


								<button
									className={ cssModObj.rowAddBut }

									data-element-name-hook='rowAddBut'

									onClick={ addEdiFun }
								>{ /* What: Add Button Element. Why: This is the real, clickable "New reminder" entry point. How: This calls addEdiFun. Its data-element-name-hook is read by help mode's Data catalog. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</button>


							) }



							{ visTasArr.length === 0 ? ( // What: Empty List Check. Why: With no reminders at all, a plain empty-state message belongs here instead of a list. How: This renders the empty message while visTasArr is empty, the real list otherwise.


								<div className={ cssModObj.lisEmpDiv }>No reminders yet. Add one to see it on Today.</div> // What: List Empty Div Element. Why: With no reminders at all, the list area needs a plain explanation. How: This renders a fixed prompt to add one.


							) : ( // What: Reminder List Branch. Why: With at least one reminder, the real list of rows belongs here instead. How: This renders the else branch, taken while visTasArr has entries.


								<>{ /* What: Reminder List Fragment Element. Why: The sort control and the list rows render together as one branch. How: This groups them with no wrapper element. */ }


									{ visTasArr.length > 1 && ( // What: Sort Visibility Check. Why: Sorting only matters once there's more than 1 reminder to sort. How: This renders SorSelCom only while there are at least 2.


										<SorSelCom
											labTexStr='Sort'
											optLisArr={ ITE_SOR_ARR }
											selIdeStr='rem-item-sort'
											value={ iteSorStr }

											onChange={ ( sorKeyStr ) => actStoObj.setSorFun( 'reminders', sorKeyStr ) }
										/> // What: Sort Select Component. Why: The Items list needs the same sort control every other Data tab list uses. How: This is driven by ITE_SOR_ARR, committing through actStoObj.setSorFun.


									) }



									{ disTasArr.map( ( curTasObj ) => { // What: Task Row List Render. Why: One full-bleed row (plus its own expanding editor) is needed per visible reminder. How: This maps disTasArr to one row div per entry, keyed by its own id.


										const carOpeBoo = opeIdeStr === curTasObj.id;  // What: Card Open Boolean. Why: This single check decides both this row's own toggle-button-vs-name-input branch and whether its editor ColDisCom is open. How: This compares opeIdeStr against curTasObj's own id.
										const isaOncBoo = curTasObj.repeat === 'once'; // What: Is-A Once Boolean. Why: The row's own type icon depends on whether this is a one-time or recurring reminder. How: This checks curTasObj's own repeat.



										return (


											<div
												key={ curTasObj.id }
												ref={ carOpeBoo ? opeRowRef : undefined } // What: Open Row Ref. Why: Only the open row is scrolled into view. How: This attaches opeRowRef only while this row is open.

												className={` ${ cssModObj.lisIteDiv }   ${ insIdeStr === curTasObj.id ? cssModObj.lisIteDivInsert : '' } `}

												data-element-name-hook='lisIteDiv'
												data-row-edit-active={ carOpeBoo || undefined } // What: Row Edit Active Attribute. Why: An open row's header stops reacting like a button and its chevron turns the accent color. How: This sets the presence-only attribute while carOpeBoo is true.

												onAnimationEnd={ () => { if ( insIdeStr === curTasObj.id ) setInsIdeStr( null ); } } // What: Insert Flag Clear. Why: The entrance animation must play only once. How: This clears insIdeStr when this row's own animation ends while it still matches.
											>{ /* What: Row Div Element. Why: This is one reminder's own full-bleed row, holding either its plain summary or its live name input, plus its own expanding editor below. How: This renders one of the 2 header branches below, then the shared editor ColDisCom. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


												{ carOpeBoo ? ( // What: Row Editing Check. Why: The row's own header swaps between a live-editable div and a plain clickable button depending on whether it's open. How: This renders the editing div while carOpeBoo is true, the plain toggle button otherwise.


													<div
														className={ cssModObj.lisRowDiv }

														data-element-name-hook='lisRowDiv'
													>{ /* What: Row Editing Div Element. Why: While editing, this is a plain div rather than a button, since a button can't legally contain the input below it (interactive-in-interactive), which also cost it an accessible name of its own. How: This renders the type icon, the live name input, and a real, separate collapse-chevron button. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


														<span
															className={ cssModObj.rowIcoSpa }

															data-element-name-hook='rowIcoSpa'
															data-reminder-once-active={ isaOncBoo || undefined } // What: Reminder Once Active Attribute. Why: Help mode finds a one-time reminder's row by its icon without reading its classes. How: This is present only while isaOncBoo is true, since undefined drops the attribute entirely.
														>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. Its data-element-name-hook is read by help mode's Data catalog. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className={ cssModObj.rowMaiSpa }>{ /* What: Row Main Span Element. Why: The live name input needs its own wrapper matching the closed row's own layout. How: This wraps the single input below. */ }


															<input
																ref={ ( inpCurEle ) => { // What: Focus Ref Callback. Why: The input should focus once when it mounts, without the browser's own focus scroll fighting the smooth scroll above. How: This focuses a newly attached input with preventScroll and remembers it.


																	if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Re-renders call this ref again, but focus should only happen once per input. How: This runs only for a real node not already focused.


																		inpCurEle.focus( { preventScroll : true } ); // What: Quiet Focus Call. Why: The row's own smooth scroll handles bringing it into view. How: This focuses without scrolling.


																		if ( newAddRef.current === curTasObj.id ) inpCurEle.select(); // What: New Reminder Select Check. Why: A brand-new reminder opens with a default name that typing should replace outright, while an existing one's name is edited in place. How: This selects the whole name only for the new reminder.



																		focInpRef.current = inpCurEle; // What: Focused Input Mark. Why: The guard above must skip this node next time. How: This stores it in focInpRef.


																	}


																} }

																className={ cssModObj.rowNamInp }

																data-element-name-hook='rowNamInp'

																maxLength={ 60 }
																placeholder='Reminder name'
																type='text'
																value={ draTasObj && draTasObj.id === curTasObj.id ? draTasObj.name : curTasObj.name } // What: Value. Why: The open row's name lives in its draft until the row is kept. How: This shows the draft's name when the draft belongs to this reminder, else the reminder's own.

																aria-label='Reminder name'

																onChange={ ( chaEveObj ) => patDraFun( { name : chaEveObj.target.value } ) }
																onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Blur Shortcut. Why: Pressing Enter should finish typing the name. How: This blurs the input on Enter, leaving the name in the draft until the row is kept.
															/>{ /* What: Name Input Element. Why: This is the row's own live-editable name field while carOpeBoo. How: This writes every keystroke into the row's draft, trimmed when the draft is kept. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


														</span>

														<button
															className={` ${ cssModObj.rowChvBut }   ${ cssModObj.chvDisSpa } `}

															data-chevron-open-active // What: Chevron Open Active Attribute. Why: This chevron only renders on an open row, so it always points down. How: This sets the presence-only attribute unconditionally.

															type='button'

															aria-label='Collapse'

															onClick={ () => kepCloFun( curTasObj.id ) }
														>{ /* What: Collapse Chevron Button Element. Why: This is the row's own real, separate close affordance (see the row-editing div's own comment above for why it can't be the button itself). How: This calls kepCloFun, which marks the editor kept before closing it. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this row's own open editor a recognizable close affordance. How: This renders the 'chvEle' icon at the bas rhythm step. */ }


														</button>


													</div>


												) : ( // What: Row Toggle Branch. Why: A closed row just needs its own plain clickable toggle button instead. How: This renders the else branch, taken while carOpeBoo is false.


													<button
														className={ cssModObj.lisRowBut }

														data-element-name-hook='lisRowBut'

														type='button'

														aria-expanded={ carOpeBoo }

														onClick={ () => { // What: Row Open Click. Why: Opening this row closes whichever row was open, and closing keeps its edits. How: This keeps the open draft, then opens this row.


															keeTasFun(); // What: Keep Task Call. Why: The row giving way keeps its edits. How: This calls keeTasFun, which does nothing when no row is open.

															setOpeIdeStr( curTasObj.id ); // What: Open Row Set Call. Why: This row's own editor opens. How: This sets opeIdeStr to this reminder's id.


														} }
													>{ /* What: Row Toggle Button Element. Why: The plain, non-editing state is itself the clickable control that opens the editor. How: This keeps any other open row's edits, then opens this one. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


														<span
															className={ cssModObj.rowIcoSpa }

															data-element-name-hook='rowIcoSpa'
															data-reminder-once-active={ isaOncBoo || undefined } // What: Reminder Once Active Attribute. Why: Help mode finds a one-time reminder's row by its icon without reading its classes. How: This is present only while isaOncBoo is true, since undefined drops the attribute entirely.
														>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. Its data-element-name-hook is read by help mode's Data catalog. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className={ cssModObj.rowMaiSpa }>{ /* What: Row Main Span Element. Why: The name and schedule summary read together as one unit, matching the editing state's own layout. How: This wraps both spans below. */ }


															<span
																className={ cssModObj.rowNamSpa }

																data-element-name-hook='rowNamSpa'
															>{ curTasObj.name }</span>{ /* What: Row Name Span Element. Why: This is the row's own primary text. How: This renders curTasObj's own name. Its data-element-name-hook is read by help mode's Data catalog. */ }

															<span className={ cssModObj.rowSumSpa }>{ TAS_NAM_OBJ.sumTasFun( curTasObj ) }</span>{ /* What: Row Summary Span Element. Why: This is the row's own secondary, schedule-summary text. How: This calls TAS_NAM_OBJ.sumTasFun against curTasObj. */ }


														</span>

														<span
															className={` ${ cssModObj.rowChvSpa }   ${ cssModObj.chvDisSpa } `}

															aria-hidden='true'
														>{ /* What: Row Chevron Span Element. Why: The plain state's own chevron is purely decorative (the whole row is already the real toggle), so it's a span rather than a separate button. How: This wraps the single IcoSvgCom below, hidden from screen readers. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this closed row's own real toggle a recognizable open affordance. How: This renders the 'chvEle' icon at the bas rhythm step. */ }


														</span>


													</button>


												) }



												<ColDisCom open={ carOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The schedule editor and its own footer only exist while this exact row is open. How: This animates the editor div below open/closed based on carOpeBoo. */ }


													<div className={ cssModObj.remEdiDiv }>{ /* What: Reminder Editor Div Element. Why: The editor needs its own padding/framing distinct from the plain row above it. How: This wraps the shared inlEdiDiv div below. */ }


														<div
															className={ cssModObj.inlEdiDiv }

															data-element-name-hook='inlEdiDiv'
														>{ /* What: Inline Editor Div Element. Why: The schedule editor and its own footer need to sit together, matching InlEdiCom's own root layout. How: This renders SchEdiCom against the row's draft, then EdiFooCom below it. Its data-element-name-hook is read by help mode's Today catalog and help mode's Data catalog. */ }


															<SchEdiCom
																aniExtBoo
																layVarStr='rows' // What: Layout Variant String. Why: The Data tab lays each field out as its own full-bleed row, matching the picker item editor. How: SchEdiCom's own module applies its rows layout class.
																staAppObj={ staAppObj }
																tasRcdObj={ draTasObj && draTasObj.id === curTasObj.id ? draTasObj : curTasObj } // What: Task Record Object. Why: The open row's editor shows its draft, while one still collapsing after a close shows the reminder itself. How: This picks the draft only when it belongs to this row's own reminder.

																onPatTasFun={ patDraFun }
															/>{ /* What: Schedule Editor Component. Why: This is the row's own schedule editor, editing its draft like Today's InlEdiCom does. How: This is passed the draft and patDraFun, so nothing reaches the store until the row is kept. */ }



															<EdiFooCom
																isaNewBoo={ newAddRef.current === curTasObj.id }

																onCanTasFun={ () => { // What: Cancel Handler. Why: Cancelling drops the row's draft, and a brand-new reminder goes away entirely. How: This marks the draft handled and closes the row, then drops a new reminder once the row's collapse animation finishes.


																	hanDraRef.current = draTasObj; // What: Handled Draft Mark. Why: The row's unmount must not keep a draft its own Cancel dropped. How: This records the dropped draft.

																	setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: Only close if this row is STILL the open one. How: This clears opeIdeStr only when it currently equals this reminder's id.



																	if ( newAddRef.current === curTasObj.id ) { // What: Discard New Guard. Why: A brand-new reminder's Cancel removes it entirely, after the row plays the same collapse-close animation as Save. How: This clears the new-item flag, then drops the local reminder after that animation's duration.


																		newAddRef.current = null; // What: New-Item Flag Clear. Why: Nothing "new" is left once its discard is underway. How: This resets newAddRef.

																		setTimeout( () => setNewTasObj( null ), durMilFun( 'p02' ) ); // What: Deferred Drop Call. Why: The local reminder must stay until the row's own collapse animation finishes. How: This clears newTasObj after that animation's duration. // Duration Base Plus 2 ~= 277.0ms


																	}


																} }
																onDelTasFun={ () => { // What: Delete Handler. Why: Deleting this row needs to drop its draft, close the row, and stage the same collapse-then-remove sequence the card-level Delete uses. How: This marks the draft handled, closes the row, then removes the reminder right away under reduced motion or after the collapse otherwise.


																	hanDraRef.current = draTasObj; // What: Handled Draft Mark. Why: A deleted reminder's draft must not be kept by the row's unmount. How: This records the dropped draft.



																	const tasIdeStr = curTasObj.id; // What: Task Identifier String. Why: The deferred delTasFun call below must not close over curTasObj itself, in case it's captured after a later re-render. How: This copies the id once.


																	setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse right away rather than wait for the deferred remove below. How: This clears opeIdeStr only when it currently equals this reminder's id.



																	if ( redMotFun() ) { actStoObj.delTasFun( tasIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant remove instead of an animated collapse-then-remove. How: This removes the reminder directly and returns.



																	setTimeout( () => actStoObj.delTasFun( tasIdeStr ), durMilFun( 'p02' ) ); // What: Deferred Remove Call. Why: The row's own collapse animation must finish before the reminder is removed. How: This calls delTasFun after that animation's duration. // Duration Base Plus 2 ~= 277.0ms


																} }
																onDonTasFun={ () => kepCloFun( curTasObj.id ) }
															/>{ /* What: Editor Footer Component. Why: This is the shared Cancel/Save/Delete footer, same component InlEdiCom uses on Today. How: Cancel drops the draft (a new reminder after its collapse), Delete removes the reminder after its collapse, and Save keeps the draft through kepCloFun. */ }



															<UnmWatCom onUnmWatFun={ () => { if ( opeIdeStr === curTasObj.id ) cloTasFun(); } } />{ /* What: Unmount Watcher Component. Why: A row that disappears without its own chevron or Save (the Reminders card or its Items section collapsing, a tab switch) still keeps its edits. How: This keeps and closes the row when the watcher unmounts while this row is still the open one. */ }


														</div>


													</div>


												</ColDisCom>


											</div>


										);


									} ) }


								</>


							) }


						</React.Fragment>


					</ColDisCom>


				</div>


			</ColDisCom>


		</section>


	);


}

// #endregion RemManCom

// #endregion Components



// #region Exports

export { RemManCom }; // What: Named Export. Why: TabDatCom renders the Reminders section. How: This exports RemManCom by name; everything else in this file stays private.

// #endregion Exports


