


// #region Imports

import '../../styles/fonts.css';  // What: Fonts Stylesheet Import. Why: The page's stylesheets assume the self-hosted font faces are already registered. How: This is imported first, purely for its side effect, so its @font-face rules register before the others are parsed.
import '../../styles/styles.css'; // What: Styles Stylesheet Import. Why: The page reads the app's own tokens and base element styles. How: This is imported purely for its side effect, the same global stylesheet the app loads.
import './legal-page.css';        // What: Legal Page Stylesheet Import. Why: The page's own layout, skip link, and links need their rules. How: This is imported last, purely for its side effect, so its rules build on the global ones.

// #endregion Imports



/**
 * legal-page.ts = Legal Page
 *
 * @summary
 * The script the standalone /privacy and /terms pages load. Importing their
 * stylesheets here lets the build bundle and fingerprint them the same way as
 * the app's. The script also gives the skip link its click handler: a plain
 * click focuses the page's <main> without putting #main in the address, while
 * a modified click is left to the browser. Without JavaScript the link still
 * works as an ordinary jump to #main.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



document.querySelector< HTMLAnchorElement >( '[data-element-name-hook~="skiLinAnc"]' )?.addEventListener( 'click', ( cliEveObj ) => { // What: Skip Link Click Listener. Why: The skip link should move focus to the main content without leaving a hash in the address. How: This handles a plain click on the skip link and leaves any other to the browser.


	const { altKey : altKeyBoo, button : butIndNum, ctrlKey : ctrKeyBoo, metaKey : metKeyBoo, shiftKey : shiKeyBoo } = cliEveObj; // What: Click Event Flags. Why: A click with another button or a modifier key held should open the link the browser's usual way. How: This reads the pressed button's index and each modifier key's state.

	const modCliBoo = butIndNum !== 0 || altKeyBoo || ctrKeyBoo || metKeyBoo || shiKeyBoo; // What: Modified Click Boolean. Why: Only a plain click is handled here. How: This is true for any button but the main one, or with Alt, Ctrl, Cmd, or Shift held.


	if ( modCliBoo ) return; // What: Modified Click Guard. Why: The browser handles a modified click itself. How: This leaves the event alone.



	cliEveObj.preventDefault(); // What: Default Jump Cancel. Why: The default jump would add #main to the address. How: This stops the browser's own navigation.

	document.getElementById( 'main' )?.focus(); // What: Main Focus Call. Why: The next Tab should continue into the main content. How: This focuses the <main>, which takes focus through its tabindex of -1.


} );


