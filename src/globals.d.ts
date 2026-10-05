


/**
 * globals.d.ts = Globals
 *
 * @summary
 * Type declarations for the values the app creates outside the module
 * graph, which TypeScript can't otherwise see: the version number Vite
 * injects at build time, and the deliberate window.__ globals that let a
 * module or index.html's boot script reach a component (see CLAUDE.md's
 * "Runtime globals on window"). This file has no imports or exports, so
 * TypeScript reads it as a global script: its interface Window merges into
 * the built-in Window type, and nothing here ends up in the build. The
 * window.__emlPickerCreated global the Pickers tab calls is deliberately
 * left out, since nothing ever assigns it and it's under investigation.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



declare const __APP_VERSION__ : string; // What: App Version Constant. Why: vite.config.ts replaces __APP_VERSION__ with package.json's version at build time, so TypeScript never sees it defined. How: This declares it as a string for constants.ts to read.



type EscEntTyp = { runFun : () => void }; // What: Escape Entry Type. Why: Every open editor that Escape should cancel puts one entry on the shared escape stack. How: This describes an entry, whose runFun cancels that editor.



interface Window { // What: Window Interface. Why: TypeScript's built-in Window doesn't know the app's own window.__ globals, so every use of one is an error. How: This merges the four globals into Window, each optional since each exists only once its own code has run.


	__dismissBootSplash? : () => void;  // What: Dismiss Boot Splash. Why: main.tsx fades out index.html's boot splash once the app has mounted. How: This is the function public/boot-splash.js assigns.
	__emlGenerate?       : () => void;  // What: Ease My Life Generate. Why: The Welcome Tour runs the real list generator on a first run. How: This is the function the Today tab assigns while it's mounted.
	__escBound?          : boolean;     // What: Escape Bound. Why: The document-level Escape listener must be attached only once, however many times its module loads. How: This is set true once ui/escape-cancel.ts attaches it.
	__escStack?          : EscEntTyp[]; // What: Escape Stack. Why: Several editors can be open at once, and Escape should cancel only the most recent. How: This is the array ui/escape-cancel.ts pushes each open editor's entry onto.


}


