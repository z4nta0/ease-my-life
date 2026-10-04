



/**
 * boot-splash.js = Boot Splash Dismissal
 *
 * @summary
 * Fades out the boot splash index.html paints while the app loads. It lives in
 * its own file rather than an inline script so the Content-Security-Policy's
 * script-src can stay 'self', with no hash or 'unsafe-inline' needed (see
 * public/_headers). The splash only fades once two things are true: the app
 * has mounted, and the equation has finished assembling, so it never vanishes
 * mid-animation. A safety timeout dismisses it regardless, so a boot that
 * never signals can't trap the page behind it. The build minifies this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Boot Splash Setup

/**
 * boot-splash.js = Boot Splash Setup
 *
 * @summary
 * Finds the splash, works out when its equation has finished assembling, and
 * registers window.__dismissBootSplash for main.jsx to call once the app has
 * mounted. Whichever of the two conditions arrives last starts the fade, and
 * the splash removes itself just after the fade ends. Under reduced motion the
 * splash shows the equation already assembled, so only the mount is waited on.
 * The assembly time is derived from the splash's own CSS timings in
 * index.html, so retiming that loop means updating the constants here too.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * ( () => { ... } )() // => void
 * ```
 *
*/

( () => { // What: Boot Splash Setup Function. Why: The splash's dismissal logic needs its own scope, run once as soon as the script loads. How: This is an immediately invoked arrow function.


	const splRooEle = document.querySelector( '[data-element-name-hook~="booSplDiv"]' ); // What: Splash Root Element. Why: Every step below works on the splash itself. How: This finds it by its hook.


	if ( !splRooEle ) return; // What: Missing Splash Guard. Why: A page without the splash has nothing to dismiss. How: This bails out of the setup.



	// #region Assembly Timing

	const tokStaNum = 0.12;                                                     // What: Token Stagger Number. Why: Each token's animation starts this many seconds after the one before it. How: This mirrors the .12s stagger in index.html's equTokSpa rule.
	const looDurNum = 3.4;                                                      // What: Loop Duration Number. Why: The equation's whole loop lasts this many seconds. How: This mirrors the 3.4s animation in index.html's equTokSpa rule.
	const popSetNum = 0.16;                                                     // What: Pop Settled Number. Why: The checkmark's pop settles this far into the loop. How: This mirrors the 16% step in index.html's equTokSpaCheckPop keyframes.
	const lasIndNum = 10;                                                       // What: Last Index Number. Why: The checkmark is the last token to appear. How: This mirrors its --equ-tok-ind of 10 in index.html.
	const assMilNum = ( lasIndNum * tokStaNum + looDurNum * popSetNum ) * 1000; // What: Assembled Milliseconds Number. Why: The splash may only fade once the checkmark has appeared and its pop has settled, about 1.74s in, rather than after a whole loop, which would hold the finished equation for nearly 3 seconds and read as a second cycle. How: This adds the last token's delay to the pop's settle point and converts it to milliseconds.

	// #endregion Assembly Timing



	// #region Dismissal State

	let disDonBoo = false; // What: Dismissal Done Boolean. Why: The fade must start only once, whichever path reaches it. How: This is set the first time hidSplFun runs.
	let appMouBoo = false; // What: App Mounted Boolean. Why: The splash waits for the app to mount. How: This is set when main.jsx calls window.__dismissBootSplash.
	let cycDonBoo = false; // What: Cycle Done Boolean. Why: The splash waits for the equation to finish assembling. How: This is set once assMilNum has passed, or at once under reduced motion.

	// #endregion Dismissal State



	// #region hidSplFun

	/**
	 * hidSplFun = Hide Splash Function
	 *
	 * @summary
	 * Starts the splash's fade by setting the data-splash-hide-active
	 * attribute its CSS fades on, then removes the splash from the page just
	 * after the .42s fade ends. It runs at most once, so the mount signal and
	 * the safety timeout can both call it without fading twice.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * hidSplFun() // => void
	 * ```
	 *
	*/

	const hidSplFun = () => { // What: Hide Splash Function. Why: Both the normal dismissal and the safety net need one shared way to fade the splash. How: This guards on disDonBoo, starts the fade, and schedules the removal.


		if ( disDonBoo ) return; // What: Already Dismissed Guard. Why: A second call must not restart the fade or schedule a second removal. How: This bails out once the fade has started.



		disDonBoo = true; // What: Dismissal Done Set. Why: Any later call should see the fade already started. How: This flips the flag before anything else happens.

		splRooEle.setAttribute( 'data-splash-hide-active', '' ); // What: Hide Attribute Set. Why: The splash's CSS fades it out while this attribute is present. How: This sets it as a presence-only attribute.

		setTimeout( () => splRooEle.remove(), 460 ); // What: Removal Timeout. Why: The faded splash should leave the page entirely once its fade is done. How: This removes it 460ms later, just after the .42s fade in index.html's booSplDiv rule ends.


	};

	// #endregion hidSplFun



	const tryHidFun = () => { if ( appMouBoo && cycDonBoo ) hidSplFun(); }; // What: Try Hide Function. Why: The fade should start only once both the app has mounted and the equation has assembled. How: This calls hidSplFun only when both flags are set.



	// #region Dismissal Triggers

	if ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) { // What: Reduced Motion Check. Why: Under reduced motion the splash shows the equation already assembled, so there is nothing to wait for. How: This marks the cycle done at once.


		cycDonBoo = true; // What: Cycle Done Set. Why: The assembled equation is already showing. How: This lets the mount alone start the fade.


	}

	else { // What: Full Motion Branch. Why: The equation has to finish assembling before the splash may fade. How: This waits assMilNum, then marks the cycle done and tries the fade.


		setTimeout( () => { // What: Assembly Timeout. Why: The fade must wait for the equation to finish. How: This fires once the checkmark has settled.


			cycDonBoo = true; // What: Cycle Done Set. Why: The equation has now finished assembling. How: This flips the flag the fade waits on.

			tryHidFun(); // What: Try Hide Call. Why: The app may already have mounted. How: This starts the fade if it has.


		}, assMilNum );


	}



	window.__dismissBootSplash = () => { // What: Dismiss Boot Splash Global. Why: main.jsx has to tell this script when the app has mounted, and this script loads outside the bundle. How: This registers a global main.jsx calls, which marks the app mounted and tries the fade.


		appMouBoo = true; // What: App Mounted Set. Why: The app has now mounted. How: This flips the flag the fade waits on.

		tryHidFun(); // What: Try Hide Call. Why: The equation may already have finished. How: This starts the fade if it has.


	};



	setTimeout( hidSplFun, 6000 ); // What: Safety Net Timeout. Why: A boot that never signals must not trap the page behind the splash. How: This fades the splash after 6 seconds regardless.

	// #endregion Dismissal Triggers


} )();

// #endregion Boot Splash Setup


