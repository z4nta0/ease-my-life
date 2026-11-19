


/**
 * feedback.ts = Feedback
 *
 * @summary
 * The shared pieces of the interaction feedback probe, for a spec that
 * checks a control's hover, press, and focus: the lists of properties a look
 * is read with, and the helpers a check runs inside the page, such as the
 * one that records a look, and the one that turns two records of a look into
 * problems. A spec collects and drives its own elements.
 * Adapted from TechGeek.support's own.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type SnaRecTyp = { // What: Snapshot Record Type. Why: An element's look, and whether each part of it would ease, is compared between two moments the same way. How: This holds one value and one duration per probed property.


	durArr : number[], // What: Duration Array. Why: A property that changes has to ease rather than snap. How: This holds each probed property's transition or animation duration in milliseconds, or 0 when neither covers it, with a color matching its parent's taking the longer of its own duration and the parent's and a currentColor border taking the color's when that's longer.
	labStr : string,   // What: Label String. Why: A problem inside a control should say which part of it snapped. How: This holds the part's tag, its first class's name, and its pseudo-element, or '' for the control itself.
	valArr : string[]  // What: Value Array. Why: Two moments are compared property by property. How: This holds each probed property's computed value.


};



declare global { // What: Global Declaration Block. Why: The settle helper hands what just animated to the snapshot helper, and each runs in its own call inside the page. How: This declares the test's own window value both read.


	interface Window { // What: Window Interface. Why: A test's own value on window needs a type, and only an interface merges with the built-in Window. How: This adds the animated property map.


		__aniProMap? : Map< Element, Record< string, number > > // What: Animation Property Map. Why: A change can be eased by an animation that plays rather than a transition, such as a check mark popping in, and that animation may have ended by the time the look is read. How: This maps each element the last settle saw animating to its animated properties, keyed by pseudo-element and camel case name, each holding its duration in milliseconds.


	}


}

// #endregion Types



// #region Constants

const CON_PRO_ARR = [ 'color', 'background-color', 'border-color', 'box-shadow', 'transform', 'translate', 'opacity', 'text-decoration-thickness' ]; // What: Control Property Array. Why: Hover, press, and toggle feedback changes these, on a control and on what's inside it, such as a switch's knob. How: Each is compared between moments, and each that changes has to be eased, the underline's thickness included, since the app's text links thicken it on hover.
const FOC_PRO_ARR = [ ...CON_PRO_ARR, 'outline-color', 'outline-offset', 'outline-width' ];                                                          // What: Focus Property Array. Why: A control's focus can change its look as well as draw its ring. How: Each is compared between unfocused and focused, and each that changes has to be eased.
const MIN_DUR_NUM = 0.5; // What: Minimum Duration Number. Why: A reduced-motion variant that JavaScript waits on keeps a .01ms duration so its end event still fires, which switches at once like none. How: A duration at or below this many milliseconds counts as no easing at all.

// #endregion Constants



// #region Helpers

// #region aniFinFun

/**
 * aniFinFun = Animation Finish Function
 *
 * @summary
 * Runs inside the page and waits until a look just changed has settled: two
 * animation frames first, so the hover, press, focus, or attribute change has
 * been styled and its transitions have started, then every animation and
 * transition on the element, everything inside it, and each of its ancestors
 * has finished, leaving out any that repeat forever. An ancestor counts since
 * a color fading on it reaches the element through inheritance. Before it
 * waits, it records each animation that isn't a transition, on the element or
 * inside it, in the window's animation property map, so the snapshot taken
 * next counts a property such an animation moved as eased. One cancelled
 * midway counts as ended. Passed to Playwright's evaluate, so it can't read
 * anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param eleCurEle - Element Current Element: The element to wait on.
 *
 * @returns A promise that settles once every finite animation has finished,
 *          with no value.
 *
 * @example
 * ```ts
 * handle.evaluate(aniFinFun) // => Promise<void>
 * ```
 *
*/

async function aniFinFun ( eleCurEle : Element ) : Promise< void > {


	for ( let fraIndNum = 0; fraIndNum < 2; fraIndNum++ ) await new Promise( ( resCurFun ) => requestAnimationFrame( resCurFun ) ); // What: Frame Wait Loop. Why: A change applied from outside the page, such as the pointer moving onto the element, may not be styled until the next frame, so its transitions wouldn't be listed yet. How: This waits two animation frames.



	const ancEleArr : Element[] = []; // What: Ancestor Element Array. Why: An ancestor's fading color reaches the element through inheritance. How: This collects every element above it.


	for ( let ancCurEle = eleCurEle.parentElement; ancCurEle; ancCurEle = ancCurEle.parentElement ) ancEleArr.push( ancCurEle ); // What: Ancestor Walk Loop. Why: Each level up can pass a color down. How: This climbs from the parent to the root, recording each element.



	const aniProMap = new Map< Element, Record< string, number > >(); // What: Animation Property Map. Why: The next snapshot has to know which properties an animation moved, even once it has ended. How: This collects them by element, for the window to hold.
	const finAniArr = [ ...eleCurEle.getAnimations( { subtree : true } ), ...ancEleArr.flatMap( ( ancCurEle ) => ancCurEle.getAnimations() ) ].filter( ( aniCurObj ) => aniCurObj.effect?.getTiming().iterations !== Infinity ); // What: Finite Animation Array. Why: A loop never finishes, so waiting on one would hang. How: This lists the animations and transitions of the element, its descendants, and its ancestors' own that end.


	for ( const aniCurObj of finAniArr ) { // What: Animation Record Loop. Why: Only an animation that isn't a transition, on the element or inside it, counts as the change's own easing. How: This records each such animation's properties against its target.


		const effCurObj = aniCurObj.effect; // What: Effect Current Object. Why: An animation's target and keyframes live on its effect. How: This reads it.


		if ( aniCurObj instanceof CSSTransition || !( effCurObj instanceof KeyframeEffect ) || !effCurObj.target || !eleCurEle.contains( effCurObj.target ) ) continue; // What: Animation Kind Guard. Why: A transition's easing is already read from the computed style, and an ancestor's animation isn't the element's own. How: This skips both, and any effect with no target.



		const proDurObj = aniProMap.get( effCurObj.target ) || {};                // What: Property Duration Object. Why: One element may play several animations. How: This reads the record already held for the target, or starts one.
		const durValNum = Number( effCurObj.getComputedTiming().activeDuration ); // What: Duration Value Number. Why: An animation with no length eases nothing. How: This reads how long the animation runs, in milliseconds.


		for ( const keyNamStr of effCurObj.getKeyframes().flatMap( ( keyCurObj ) => Object.keys( keyCurObj ) ) ) proDurObj[ `${ effCurObj.pseudoElement || '' }|${ keyNamStr }` ] = durValNum; // What: Keyframe Name Loop. Why: Each property a keyframe sets is one the animation moves. How: This records each under its pseudo-element and camel case name.



		aniProMap.set( effCurObj.target, proDurObj ); // What: Target Record Call. Why: The snapshot reads the record by element. How: This stores it against the target.


	}



	window.__aniProMap = aniProMap; // What: Animation Map Assignment. Why: The snapshot runs in its own call, so it can only read what the page holds. How: This hands the map to the window, replacing the last settle's.


	await Promise.all( finAniArr.map( ( aniCurObj ) => aniCurObj.finished.catch( () => undefined ) ) ); // What: Animation Finish Wait. Why: The look is read only once every entrance and transition has ended. How: This waits on each one's finished promise, treating one cancelled midway, such as a transition a new one replaced, as ended too, since its promise rejects rather than resolves.


}

// #endregion aniFinFun



// #region chaValFun

/**
 * chaValFun = Change Value Function
 *
 * @summary
 * Says whether a probed property changed between two snapshots in a way that
 * shows. Most properties change whenever their values differ, but an
 * outline's color, offset, and width read with a leading ~ while no outline
 * is drawn: the color counts only while the outline is drawn both times,
 * since a ring growing in from no width shows only its final color, and the
 * offset and width count unless the outline is undrawn both times, since a
 * ring that grows in close has to ease both, while a field that draws no
 * outline can change them unseen.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param proNamStr - Property Name String: The property compared.
 * @param froValStr - From Value String: Its value before the change.
 * @param tarValStr - Target Value String: Its value after the change.
 *
 * @returns Whether the change shows.
 *
 * @example
 * ```ts
 * chaValFun('outline-color', '~rgb(0, 0, 0)', 'rgb(0, 90, 200)') // => false
 * ```
 *
*/

function chaValFun ( proNamStr : string, froValStr : string, tarValStr : string ) : boolean {


	const froUndBoo = froValStr.startsWith( '~' ); // What: From Undrawn Boolean. Why: An undrawn outline's color doesn't show. How: This is true when the earlier value carries the undrawn mark.
	const tarUndBoo = tarValStr.startsWith( '~' ); // What: Target Undrawn Boolean. Why: An undrawn outline's color doesn't show. How: This is true when the later value carries the undrawn mark.


	if ( froValStr === tarValStr ) return false; // What: Same Value Guard. Why: An unchanged value is no change. How: This returns false for one.



	if ( proNamStr === 'outline-color' ) return !froUndBoo && !tarUndBoo; // What: Outline Color Return. Why: A ring's color shows only while it's drawn. How: This counts the change only when the outline is drawn both times.



	return !( froUndBoo && tarUndBoo ); // What: Change Verdict Return. Why: Any other value shows when it changes, and an offset or width shows unless the ring is undrawn both times. How: This counts the change unless both values carry the undrawn mark, which only the offset's and width's can.


}

// #endregion chaValFun



// #region cliBloFun

/**
 * cliBloFun = Click Block Function
 *
 * @summary
 * Runs inside the page and cancels every click before the app handles it, so
 * pressing a control during a check never runs its action, such as checking
 * off a card or switching tabs. It listens on the document in the capture
 * phase, ahead of React's own listener on the app's root, and both prevents
 * the click's default and stops it from going any further. Passed to
 * Playwright's evaluate, so it can't read anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * page.evaluate(cliBloFun) // => void
 * ```
 *
*/

function cliBloFun () : void {


	document.addEventListener( 'click', ( cliEveObj ) => { // What: Click Block Listener. Why: A press during a check shouldn't do anything. How: This cancels every click in the capture phase, before the page or React sees it.


		cliEveObj.preventDefault(); // What: Default Prevention Call. Why: A link shouldn't navigate mid-check. How: This cancels the click's default.

		cliEveObj.stopPropagation(); // What: Propagation Stop Call. Why: React's handlers, such as a tab button switching tabs, shouldn't run either. How: This keeps the click from reaching the app's root.


	}, true ); // What: Capture Phase Flag. Why: The block has to run ahead of the app's own handlers. How: This registers the listener for the capture phase.


}

// #endregion cliBloFun



// #region movProFun

/**
 * movProFun = Moving Problems Function
 *
 * @summary
 * The reduced-motion counterpart of {@link snaProFun}: compares two snapshots
 * of the same element, taken before and after a change, and returns one
 * problem for each probed property that changed on the element or anything
 * inside it while a transition or animation still eases it for longer than
 * {@link MIN_DUR_NUM}, read from the later snapshot. A property that eases on
 * several inner elements is one problem, naming the first part it eased on.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param froRecArr - From Record Array: The snapshot before the change.
 * @param tarRecArr - Target Record Array: The snapshot after the change.
 * @param proNamArr - Property Name Array: The probed property names, in the
 *                    snapshots' order.
 * @param desLabStr - Description Label String: The element's name in each
 *                    problem.
 * @param staNamStr - State Name String: The change in each problem, such as
 *                    'when toggled on'.
 *
 * @returns One problem per eased property.
 *
 * @example
 * ```ts
 * movProFun(inaSnaArr, actSnaArr, CON_PRO_ARR, 'button "Today"',
 *   'when toggled on')
 * // => []
 * ```
 *
*/

function movProFun ( froRecArr : SnaRecTyp[], tarRecArr : SnaRecTyp[], proNamArr : string[], desLabStr : string, staNamStr : string ) : string[] {


	const movNamMap = new Map< string, string >(); // What: Moving Name Map. Why: A property that eases on several inner elements is one problem, named by the first part it eased on. How: This maps each eased property's name to that part's label.


	for ( const [ recIndNum, tarCurObj ] of tarRecArr.entries() ) { // What: Record Compare Loop. Why: Every element of the snapshot has to switch its changes at once. How: This compares each later record with the earlier one in its place.


		const froCurObj = froRecArr[ recIndNum ]; // What: From Current Object. Why: The change is read against the same element's earlier record. How: This finds it by place.


		if ( !froCurObj ) continue; // What: Missing Record Guard. Why: An element that appeared with the change has nothing to compare with. How: This skips it.



		for ( const [ proIndNum, proNamStr ] of proNamArr.entries() ) if ( chaValFun( proNamStr, froCurObj.valArr[ proIndNum ], tarCurObj.valArr[ proIndNum ] ) && tarCurObj.durArr[ proIndNum ] > MIN_DUR_NUM && !movNamMap.has( proNamStr ) ) movNamMap.set( proNamStr, tarCurObj.labStr ); // What: Property Compare Loop. Why: Under reduced motion a change should switch rather than ease. How: This records each one whose value changed while its later duration runs longer than the minimum, with the label of the first part it eased on.


	}



	return [ ...movNamMap ].map( ( [ proNamStr, parLabStr ] ) => `${ desLabStr } eases its ${ proNamStr }${ parLabStr ? ` on its ${ parLabStr }` : '' } ${ staNamStr } under reduced motion` ); // What: Motion Problems Return. Why: Each eased property should be reported plainly, with the part it eased on when that's inside the control. How: This turns each name into a problem line.


}

// #endregion movProFun



// #region snaEleFun

/**
 * snaEleFun = Snapshot Element Function
 *
 * @summary
 * Runs inside the page and records how an element looks right now, and whether
 * each part of that look would ease if it changed: for the element, every
 * element inside it, and the ::before and ::after each of them draws, each
 * probed property's computed value and the duration of the transition covering
 * it, listed by its own name, by a shorthand holding it (such as background
 * for background-color), or by all, or 0 when none is. A property an animation
 * moved during the last settle, as the window's animation property map
 * records, takes the longer of that duration and the animation's. Every
 * element takes three records in a row, its own then its ::before's and its
 * ::after's, and a pseudo-element it doesn't draw is recorded empty, so two
 * snapshots line up place by place even when a state draws one. The border
 * color reads only the sides actually drawn, those with a width above zero, as
 * one color when they all share it, since an undrawn side's color can change
 * without anything showing, and the outline's color, offset, and width carry a
 * leading ~ while no outline is drawn, for {@link chaValFun} to weigh. A
 * record whose color matches its parent's takes the longer of its own duration
 * for it and the parent's, since an inherited color eases with the parent's
 * transition, a pseudo-element's parent being the element drawing it, and a
 * border color matching the record's own color takes the longer of its own
 * duration and the color's, since an unset border color is currentColor and
 * follows the color as it eases. An identity matrix reads as none, since the
 * two draw the same, and a property an animation that repeats forever drives
 * on the element itself reads as looping, since the loop moves it whatever the
 * state. Every record but the element's own is labeled with its part, for a
 * problem to name. Passed to Playwright's evaluate, so it can't read anything
 * from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param eleCurEle - Element Current Element: The element to record.
 * @param proNamArr - Property Name Array: The property names to probe.
 *
 * @returns Three records per element, the element itself first.
 * @see {@link snaRecArr}
 *
 * @example
 * ```ts
 * handle.evaluate(snaEleFun, CON_PRO_ARR) // => [ { durArr, valArr }, ... ]
 * ```
 *
*/

function snaEleFun ( eleCurEle : Element, proNamArr : string[] ) : SnaRecTyp[] {


	// #region Snapshot Record Builders

	const parNamObj : Record< string, string > = { 'background-color' : 'background', 'border-color' : 'border', 'outline-color' : 'outline', 'outline-offset' : 'outline-offset', 'outline-width' : 'outline', 'text-decoration-thickness' : 'text-decoration' }; // What: Parent Name Object. Why: A transition listed by a shorthand covers the longhands inside it. How: This maps each probed longhand that has a shorthand to it, and the outline's offset, which no shorthand holds, to itself. // What: Background Color Parent. Why: A background transition covers its color. How: This maps background-color to background. // What: Border Color Parent. Why: A border transition covers its color. How: This maps border-color to border. // What: Outline Color Parent. Why: An outline transition covers its color. How: This maps outline-color to outline. // What: Outline Offset Parent. Why: The outline shorthand doesn't hold the offset. How: This maps outline-offset to its own name. // What: Outline Width Parent. Why: An outline transition covers its width. How: This maps outline-width to outline. // What: Text Decoration Thickness Parent. Why: A text-decoration transition covers its thickness. How: This maps text-decoration-thickness to text-decoration.



	const borValFun = ( styCurObj : CSSStyleDeclaration ) : string => [ ...new Set( [ 'top', 'right', 'bottom', 'left' ].filter( ( sidNamStr ) => styCurObj.getPropertyValue( `border-${ sidNamStr }-width` ) !== '0px' ).map( ( sidNamStr ) => styCurObj.getPropertyValue( `border-${ sidNamStr }-color` ) ) ) ].join( ' ' ); // What: Border Value Function. Why: Only a drawn border's color shows, so an undrawn side changing color isn't feedback. How: This joins the distinct colors of the sides wider than zero, one color when they share it.



	const snaStyFun = ( styCurObj : CSSStyleDeclaration | null ) : SnaRecTyp => { // What: Snapshot Style Function. Why: Each element and pseudo-element is recorded the same way. How: This reads its probed values and the duration covering each, or an empty record for a pseudo-element that isn't drawn.


		if ( !styCurObj ) return { durArr : proNamArr.map( () => 0 ), labStr : '', valArr : proNamArr.map( () => '' ) }; // What: Undrawn Pseudo Guard. Why: A pseudo-element that isn't drawn has no look, but still holds its place so the snapshots line up. How: This returns a record of empty values and zero durations.



		const outDraBoo = styCurObj.outlineStyle !== 'none' && parseFloat( styCurObj.outlineWidth ) > 0;                                                                // What: Outline Drawn Boolean. Why: An outline with no width or style draws nothing, so its color can follow the text color unseen, the way an undrawn border side's can. How: This is true when the outline has a style and a width above zero.
		const traDurArr = styCurObj.transitionDuration.split( ',' ).map( ( traDurStr ) => parseFloat( traDurStr ) * ( traDurStr.trim().endsWith( 'ms' ) ? 1 : 1000 ) ); // What: Transition Duration Array. Why: A covered property eases only with a duration above zero. How: This reads each listed duration in milliseconds.
		const traNamArr = styCurObj.transitionProperty.split( ',' ).map( ( traNamStr ) => traNamStr.trim() );                                                           // What: Transition Name Array. Why: A property eases only when its transition lists it. How: This reads each listed property name.


		const durProFun = ( proNamStr : string ) : number => { // What: Duration Property Function. Why: Each probed property needs the duration of whichever transition covers it. How: This finds the first listing by its name, its shorthand, or all, and reads its duration, which repeats when fewer durations than names are listed.


			const traIndNum = traNamArr.findIndex( ( traNamStr ) => [ proNamStr, 'all', parNamObj[ proNamStr ] ].includes( traNamStr ) ); // What: Transition Index Number. Why: The covering transition's place picks its duration. How: This finds the first name that covers the property.



			return traIndNum < 0 ? 0 : traDurArr[ traIndNum % traDurArr.length ]; // What: Covering Duration Return. Why: An uncovered property has no transition at all. How: This returns 0 for one, or its listing's duration.


		};



		return { // What: Snapshot Record Return. Why: Each record holds its values and durations side by side. How: This reads both for every probed property.


			durArr : proNamArr.map( durProFun ), // What: Duration Array. Why: A property that changes has to ease rather than snap. How: This reads the duration of the transition covering each probed property, or 0 when none does.
			labStr : '',                         // What: Label String. Why: Each record is named once the list is built, when its element is known. How: This starts it empty.

			valArr : proNamArr.map( ( proNamStr ) => ( proNamStr === 'border-color' ? borValFun( styCurObj ) : `${ /^outline-(color|offset|width)$/.test( proNamStr ) && !outDraBoo ? '~' : '' }${ styCurObj.getPropertyValue( proNamStr ).replace( /^matrix\(1, 0, 0, 1, 0, 0\)$/, 'none' ) }` ) ) // What: Value Array. Why: Two moments are compared property by property. How: This reads each probed property's computed value, taking the border color from its drawn sides only, reading an identity matrix as none, since a transform settled at translateY( 0 ) draws the same as no transform, and marking the outline's color, offset, and width with a leading ~ while no outline is drawn.


		};


	};

	// #endregion Snapshot Record Builders



	// #region Snapshot Record List

	const eleLisArr = [ eleCurEle, ...eleCurEle.querySelectorAll( '*' ) ]; // What: Element List Array. Why: A change to an inner element counts as the element's own. How: This lists the element and everything inside it, parents before children.
	const styLisArr = eleLisArr.flatMap( ( lisCurEle ) => [ getComputedStyle( lisCurEle ), ...[ '::before', '::after' ].map( ( pseNamStr ) => getComputedStyle( lisCurEle, pseNamStr ) ).map( ( pseStyObj ) => ( /^(none|normal)$/.test( pseStyObj.content ) ? null : pseStyObj ) ) ] ); // What: Style List Array. Why: The app's pseudo-elements draw parts of a control's look, such as a mode option's dot, and their fade is part of that look. How: This lists each element's computed styles followed by its ::before's and its ::after's, null for one with no content, which isn't drawn.
	const snaRecArr = styLisArr.map( snaStyFun );                          // What: Snapshot Record Array. Why: Each element and pseudo-element is recorded. How: This snapshots every listed style.


	for ( const [ recIndNum, snaRecObj ] of snaRecArr.entries() ) if ( recIndNum ) snaRecObj.labStr = `${ eleLisArr[ Math.floor( recIndNum / 3 ) ].tagName.toLowerCase() } ${ ( eleLisArr[ Math.floor( recIndNum / 3 ) ].classList[ 0 ] || '' ).replace( /^_([A-Za-z]+(--[a-z]+)?)_.*$/, '$1' ) }${ [ '', '::before', '::after' ][ recIndNum % 3 ] }`.trim(); // What: Record Label Loop. Why: A problem inside a control should name the part that snapped, the way a reader of the stylesheet knows it. How: This names every record but the control's own by its tag, its first class with Vite's hash taken off, and its pseudo-element.

	// #endregion Snapshot Record List



	// #region Duration Adjustments

	const aniProMap = window.__aniProMap || new Map< Element, Record< string, number > >(); // What: Animation Property Map. Why: A property an animation moved during the last settle counts as eased. How: This reads the map the settle left, or an empty one before any settle.
	const borIndNum = proNamArr.indexOf( 'border-color' );                                  // What: Border Index Number. Why: An unset border color follows the color, so its place is checked against color's. How: This finds its place, or -1 when it isn't probed.
	const colIndNum = proNamArr.indexOf( 'color' );                                         // What: Color Index Number. Why: Only color is inherited among the probed properties. How: This finds its place, or -1 when it isn't probed.
	const borColBoo = borIndNum >= 0 && colIndNum >= 0;                                     // What: Border Color Boolean. Why: The currentColor check needs both properties probed. How: This is true when the border color and the color are both in the list.


	for ( const [ lisIndNum, lisCurEle ] of eleLisArr.entries() ) { // What: Animated Property Loop. Why: A property an animation moved, or one an endless animation keeps moving, isn't read from the transition alone. How: This gives each animated property its animation's duration, and replaces each property an endless animation on an element drives with one fixed word in that element's record.


		const proDurObj = aniProMap.get( lisCurEle ) || {}; // What: Property Duration Object. Why: The settle recorded what each element animated. How: This reads the element's record, or an empty one.
		const looNamArr = lisCurEle.getAnimations().flatMap( ( aniCurObj ) => ( aniCurObj.effect instanceof KeyframeEffect && aniCurObj.effect.getTiming().iterations === Infinity ? aniCurObj.effect.getKeyframes() : [] ) ).flatMap( ( keyCurObj ) => Object.keys( keyCurObj ) ); // What: Looping Name Array. Why: Only the properties an endless animation drives are set aside. How: This lists the keys of every keyframe of the element's endless animations, written in camel case.


		for ( const [ proIndNum, proNamStr ] of proNamArr.entries() ) { // What: Probed Property Loop. Why: Each probed property is checked against both animation lists. How: This reads its camel case name and looks it up in each.


			const camNamStr = proNamStr.replace( /-[a-z]/g, ( matCurStr ) => matCurStr[ 1 ].toUpperCase() ); // What: Camel Name String. Why: Keyframes name their properties in camel case. How: This converts the probed name.


			for ( const [ pseIndNum, pseNamStr ] of [ '', '::before', '::after' ].entries() ) { // What: Pseudo Record Loop. Why: An animation may play on the element or on one of its pseudo-elements. How: This checks each of the element's three records in turn.


				const aniDurNum = proDurObj[ `${ pseNamStr }|${ camNamStr }` ]; // What: Animation Duration Number. Why: Only a property the animation moved counts. How: This reads its duration, or undefined.


				if ( aniDurNum !== undefined ) snaRecArr[ lisIndNum * 3 + pseIndNum ].durArr[ proIndNum ] = Math.max( snaRecArr[ lisIndNum * 3 + pseIndNum ].durArr[ proIndNum ], aniDurNum ); // What: Animated Duration Assignment. Why: A property an animation moved was eased by it. How: This takes the longer of the transition's duration and the animation's.


			}



			if ( looNamArr.includes( camNamStr ) ) snaRecArr[ lisIndNum * 3 ].valArr[ proIndNum ] = 'looping'; // What: Looping Value Assignment. Why: A looping property should read the same at every moment. How: When an endless animation drives the property, this records it as looping.


		}


	}



	for ( const [ recIndNum, snaRecObj ] of snaRecArr.entries() ) { // What: Inherited Color Loop. Why: A record whose color comes from its parent eases with the parent's transition. How: This gives each one whose color matches its parent's the longer of its own and its parent's durations, in document order, so it passes down every level.


		const hosCurEle = eleLisArr[ Math.floor( recIndNum / 3 ) ];                                        // What: Host Current Element. Why: Each element's three records sit together, so the record's place names the element it belongs to. How: This finds that element.
		const hosParNum = hosCurEle.parentElement ? eleLisArr.indexOf( hosCurEle.parentElement ) * 3 : -1; // What: Host Parent Number. Why: An element inherits from its parent element, whose own record leads its three. How: This finds that record's place, or a negative number when the parent sits outside the element.
		const parIndNum = recIndNum % 3 ? recIndNum - recIndNum % 3 : hosParNum;                           // What: Parent Index Number. Why: A pseudo-element inherits from the element drawing it, and an element from its parent. How: This picks the element's own record for a pseudo-element, or its parent's record for an element.


		if ( parIndNum < 0 || colIndNum < 0 ) continue; // What: No Parent Guard. Why: The element itself, and every record when color isn't probed, keeps its own duration. How: This skips them.



		if ( snaRecObj.valArr[ colIndNum ] === snaRecArr[ parIndNum ].valArr[ colIndNum ] ) snaRecObj.durArr[ colIndNum ] = Math.max( snaRecObj.durArr[ colIndNum ], snaRecArr[ parIndNum ].durArr[ colIndNum ] ); // What: Inherited Duration Assignment. Why: A color matching the parent's may be the parent's, eased by the parent's transition, while a color the record sets itself still eases with its own. How: This takes the longer of its own color duration and the parent's.


	}



	for ( const snaRecObj of snaRecArr ) if ( borColBoo && snaRecObj.valArr[ borIndNum ] === snaRecObj.valArr[ colIndNum ] ) snaRecObj.durArr[ borIndNum ] = Math.max( snaRecObj.durArr[ borIndNum ], snaRecObj.durArr[ colIndNum ] ); // What: Current Color Border Loop. Why: A border color matching the record's own color is currentColor, which follows the color as it eases. How: This gives each such border color the longer of its own duration and the color's.

	// #endregion Duration Adjustments



	return snaRecArr; // What: Snapshot Records Return. Why: Two moments' records are compared. How: This hands back every record.


}

// #endregion snaEleFun



// #region snaProFun

/**
 * snaProFun = Snap Problems Function
 *
 * @summary
 * Compares two snapshots of the same element, taken before and after a
 * change, and returns one problem for each probed property that changed on
 * the element or anything inside it with no transition or animation longer
 * than {@link MIN_DUR_NUM} to ease it, read from the later snapshot, since a
 * change eases with the transition of the state it moves into. A property
 * that snaps on several inner elements is one problem, naming the first part
 * it snapped on.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param froRecArr - From Record Array: The snapshot before the change.
 * @param tarRecArr - Target Record Array: The snapshot after the change.
 * @param proNamArr - Property Name Array: The probed property names, in the
 *                    snapshots' order.
 * @param desLabStr - Description Label String: The element's name in each
 *                    problem.
 * @param staNamStr - State Name String: The change in each problem, such as
 *                    'when hovered'.
 *
 * @returns One problem per snapped property.
 *
 * @example
 * ```ts
 * snaProFun(resSnaArr, hovSnaArr, CON_PRO_ARR, 'button "Today"',
 *   'when hovered')
 * // => []
 * ```
 *
*/

function snaProFun ( froRecArr : SnaRecTyp[], tarRecArr : SnaRecTyp[], proNamArr : string[], desLabStr : string, staNamStr : string ) : string[] {


	const snaNamMap = new Map< string, string >(); // What: Snapped Name Map. Why: A property that snaps on several inner elements is one problem, named by the first part it snapped on. How: This maps each snapped property's name to that part's label.


	for ( const [ recIndNum, tarCurObj ] of tarRecArr.entries() ) { // What: Record Compare Loop. Why: Every element of the snapshot has to ease its own probed changes. How: This compares each later record with the earlier one in its place.


		const froCurObj = froRecArr[ recIndNum ]; // What: From Current Object. Why: The change is read against the same element's earlier record. How: This finds it by place.


		if ( !froCurObj ) continue; // What: Missing Record Guard. Why: An element that appeared with the change has nothing to compare with. How: This skips it.



		for ( const [ proIndNum, proNamStr ] of proNamArr.entries() ) if ( chaValFun( proNamStr, froCurObj.valArr[ proIndNum ], tarCurObj.valArr[ proIndNum ] ) && tarCurObj.durArr[ proIndNum ] <= MIN_DUR_NUM && !snaNamMap.has( proNamStr ) ) snaNamMap.set( proNamStr, tarCurObj.labStr ); // What: Property Compare Loop. Why: A property that changed with nothing to ease it snaps. How: This records each one whose value changed while its later duration is no longer than the minimum, with the label of the first part it snapped on.


	}



	return [ ...snaNamMap ].map( ( [ proNamStr, parLabStr ] ) => `${ desLabStr } snaps its ${ proNamStr }${ parLabStr ? ` on its ${ parLabStr }` : '' } ${ staNamStr }` ); // What: Snap Problems Return. Why: Each snapped property should be reported plainly, with the part it snapped on when that's inside the control. How: This turns each name into a problem line.


}

// #endregion snaProFun



// #region valSigFun

/**
 * valSigFun = Value Signature Function
 *
 * @summary
 * Joins every probed value of a snapshot into one string, so two looks are
 * the same only when every value of every element in them matches. The
 * durations are left out, since only the look is compared, and so are an
 * undrawn outline's color and offset, which read as one mark.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param snaRecArr - Snapshot Record Array: The snapshot to sign.
 *
 * @returns The snapshot's values as one string.
 *
 * @example
 * ```ts
 * valSigFun(resSnaArr) // => '[["rgb(23, 27, 33)", ...]]'
 * ```
 *
*/

const valSigFun = ( snaRecArr : SnaRecTyp[] ) : string => JSON.stringify( snaRecArr.map( ( snaRecObj ) => snaRecObj.valArr.map( ( valCurStr ) => ( valCurStr.startsWith( '~' ) ? '~' : valCurStr ) ) ) ); // What: Value Signature Function. Why: A look is the same between two moments only when every probed value that shows matches. How: This joins every record's values into one string to compare, reading an undrawn outline's color and offset as one mark.

// #endregion valSigFun

// #endregion Helpers



// #region Exports

export { aniFinFun, cliBloFun, CON_PRO_ARR, FOC_PRO_ARR, MIN_DUR_NUM, movProFun, snaEleFun, snaProFun, valSigFun }; // What: Named Exports. Why: The probe's shared pieces live apart from the spec that reads them. How: This exports the property lists, the minimum duration, the settle, snapshot, and comparison helpers, and the click block.

// #endregion Exports


