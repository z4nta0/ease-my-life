


// #region Imports

import cssModObj from './filter-rail.module.css'; // What: CSS Module Object. Why: The filter row, its label, its scrolling rail, and its pills are styled from their own module. How: This maps each class name in filter-rail.module.css to its hashed module class.

// #endregion Imports



/**
 * filter-rail.tsx = Filter Rail
 *
 * @summary
 * The labeled row of filter pills a tab offers for narrowing by group or by
 * type: an "All" pill that clears the filter, then one pill per choice, each
 * with its own count, in a rail that scrolls sideways once its pills outgrow
 * the row. Each tab decides which choices
 * and counts the rail shows and what a pill does when chosen.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type FacProTyp = { allCouNum : number, allSelBoo : boolean, ariLabStr : string, 'data-element-name-hook' : string, entIteArr : { cliFun : () => void, couNum : number, keyStr : string, namStr : string, selBoo : boolean }[], isaDisBoo? : boolean, labTexStr : string, onAllPilFun : () => void, ref : React.Ref< HTMLDivElement > }; // What: Filter-Rail-Component Props Type. Why: A rail names itself, counts and marks its "All" pill and each choice, can be disabled, and hands each pill its own action. How: This types FilRaiCom's props, named Fac since Frc already belongs to FilRowCom.

// #region FilRaiCom

/**
 * FilRaiCom = Filter Rail Component
 *
 * @summary
 * Draws one labeled filter row: its label above a sideways-scrolling tab
 * list holding an "All" pill first and then one pill per entry, in the
 * order given. Each pill shows its own count, marks itself selected through
 * aria-selected, and runs its own action when clicked. The rail element
 * takes the given ref, so its tab can fade the rail's edges as it scrolls.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.allCouNum              - All Count Number: The "All" pill's
 *                                       count.
 * @param props.allSelBoo              - All Selected Boolean: Whether the
 *                                       "All" pill is the selected one.
 * @param props.ariLabStr              - ARIA Label String: The rail's
 *                                       accessible name.
 * @param props.data-element-name-hook - Data Element Name Hook: The rail's
 *                                       identity hook.
 * @param props.entIteArr              - Entry Item Array: One { cliFun,
 *                                       couNum, keyStr, namStr, selBoo }
 *                                       entry per pill after "All".
 * @param props.isaDisBoo              - Is-A Disabled Boolean: Whether every
 *                                       pill is disabled.
 * @param props.labTexStr              - Label Text String: The row's
 *                                       visible label.
 * @param props.onAllPilFun            - On All Pill Function: Called when
 *                                       the "All" pill is clicked.
 * @param props.ref                    - Reference: Attached to the rail
 *                                       element.
 *
 * @returns The filter row.
 *
 * @example
 * ```tsx
 * FilRaiCom({ allCouNum, allSelBoo, ariLabStr, ... }) // => <FilRaiCom />
 * ```
 *
*/

function FilRaiCom ( { allCouNum, allSelBoo, ariLabStr, 'data-element-name-hook' : hooNamStr, entIteArr, isaDisBoo, labTexStr, onAllPilFun, ref } : FacProTyp ) : React.JSX.Element {


	return (


		<div className={ cssModObj.filRowDiv }>{ /* What: Filter Row Div Element. Why: The row's label and its own pill rail sit together as one filter. How: This wraps filLabSpa and the filRaiDiv rail. */ }


			<span className={ cssModObj.filLabSpa }>{ labTexStr }</span>{ /* What: Filter Label Span Element. Why: The rail below needs a readable label. How: This renders labTexStr. */ }

			<div
				ref={ ref }

				className={ cssModObj.filRaiDiv }

				data-element-name-hook={ hooNamStr }
				data-rail-wheel-scroll

				aria-label={ ariLabStr }
				role='tablist'
			>{ /* What: Filter Rail Div Element. Why: The "All" pill and one pill per choice need a horizontally scrolling tab list. How: This wraps the "All" pill and one pill per entry in entIteArr. Its data-element-name-hook is read by the tours, help mode, and the test suites. */ }


				<button
					className={ cssModObj.filPilBut }

					data-element-name-hook='filPilBut'

					disabled={ isaDisBoo }
					type='button'

					aria-selected={ allSelBoo }
					role='tab'

					onClick={ onAllPilFun }
				>{ /* What: All Pill Button Element. Why: The user needs a way to clear the filter back to unfiltered. How: This marks itself selected when allSelBoo and runs onAllPilFun. Its data-element-name-hook is read by the tours and help mode. */ }


					All

					<span className={ cssModObj.filCouSpa }>{ allCouNum }</span>{ /* What: All Count Span Element. Why: The "All" pill shows its own total. How: This renders allCouNum. */ }


				</button>

				{ entIteArr.map( ( entCurObj ) => ( // What: Entry Pill Map. Why: Every choice needs its own selectable pill with its own count. How: This maps entIteArr to one tab-role button each, keyed by its own keyStr.


					<button
						key={ entCurObj.keyStr }

						className={ cssModObj.filPilBut }

						data-element-name-hook='filPilBut'

						disabled={ isaDisBoo }
						type='button'

						aria-selected={ entCurObj.selBoo }
						role='tab'

						onClick={ entCurObj.cliFun }
					>{ /* What: Entry Pill Button Element. Why: Clicking a pill narrows the tab to that choice. How: This marks itself selected when entCurObj.selBoo and runs entCurObj.cliFun. Its data-element-name-hook is read by the tours and help mode. */ }


						{ entCurObj.namStr }{ /* What: Pill Name Expression. Why: Every pill needs its own visible label. How: This renders entCurObj.namStr. */ }

						<span className={ cssModObj.filCouSpa }>{ entCurObj.couNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many entries it holds. How: This renders entCurObj.couNum. */ }


					</button>


				) ) }


			</div>


		</div>


	);


}

// #endregion FilRaiCom

// #endregion Components



// #region Exports

export { FilRaiCom }; // What: Named Export. Why: The filter rail is one shared component. How: This exports FilRaiCom by name.

// #endregion Exports


