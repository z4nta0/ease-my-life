


// #region Imports

import cssModObj from './update-note.module.css'; // What: CSS Module Object. Why: The note's region and panel styles live in its own module. How: Each className reads its class from this object.
import React     from 'react';                    // What: React. Why: The note follows the update module's state. How: This is used directly (React.useSyncExternalStore).


import { ButBasCom   } from './button.tsx';          // What: Button Base Component. Why: The Reload action is a shared button like every other. How: This renders it.
import { UPD_NAM_OBJ } from '../platform/update.ts'; // What: Update Namespace Object. Why: The note shows once an update is ready and reloads on demand. How: This reads the update state and calls its reload.


import type { JSX } from 'react'; // What: JSX. Why: The component declares the element it returns. How: This types its return as a JSX element.

// #endregion Imports



/**
 * update-note.tsx = Update Note
 *
 * @summary
 * The note the app shows at the top of the open tab once a new version has
 * taken over while something was under way, so the update waits for the
 * person instead of reloading under them. Its status region is in the page
 * from the first render and stays empty until then.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region UpdNotCom

/**
 * UpdNotCom = Update Note Component
 *
 * @summary
 * Renders a status region that stays empty until a new version is ready, then
 * holds a short message and a Reload button that loads the new version.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The note's status region.
 *
 * @example
 * ```tsx
 * UpdNotCom() // => <UpdNotCom />
 * ```
 *
*/

function UpdNotCom () : JSX.Element {


	const updReaBoo = React.useSyncExternalStore( UPD_NAM_OBJ.subAddFun, UPD_NAM_OBJ.updReaFun ); // What: Update Ready Boolean. Why: The note shows only once a new version is ready. How: This subscribes to the update module and reads its flag.



	return (


		<div
			className={ cssModObj.updNotDiv }

			data-element-name-hook='updNotDiv'

			role='status'
		>{ /* What: Update Note Div Element. Why: The note has to reach screen reader users, and a region added at the moment it speaks is often missed. How: This stays in the tab from the first render, empty until an update is ready. Its data-element-name-hook is read by the test suites. */ }


			{ updReaBoo && ( // What: Update Ready Check. Why: The note exists only once a new version is waiting. How: This renders the panel only while updReaBoo is true.


				<div className={ cssModObj.updRowDiv }>{ /* What: Update Row Div Element. Why: The message and its button read as one note. How: This draws the raised panel holding both. */ }


					<span className={ cssModObj.updMesSpa }>A new version of Ease My Life is ready.</span>{ /* What: Update Message Span Element. Why: The note says what's waiting. How: This renders the fixed message. */ }



					<ButBasCom
						data-element-name-hook='updRelBut'

						kinValStr='secondary'
						sizValStr='sm'

						onClick={ UPD_NAM_OBJ.relNowFun }
					>Reload</ButBasCom>{ /* What: Button Base Component. Why: The person chooses when to load the new version, once whatever was under way is done. How: This reloads the page when pressed. */ }


				</div>


			) }


		</div>


	);


}

// #endregion UpdNotCom

// #endregion Components



// #region Exports

export { UpdNotCom }; // What: Named Export. Why: The update note is this file's one public binding. How: This exports UpdNotCom by name.

// #endregion Exports


