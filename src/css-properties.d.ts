


/**
 * css-properties.d.ts = CSS Properties
 *
 * @summary
 * Lets a React style object set a CSS custom property, such as the coach
 * card's '--coa-arr-off' or a Today card's '--con-dir-ang', which hands a
 * runtime value to the element's own module CSS. React's CSSProperties type
 * only knows real CSS property names, so without this every such style object
 * is an error. Unlike globals.d.ts, this file has to be a module (its empty
 * export below), since only a module can augment another module's types; a
 * global script declaring module 'react' would replace React's types instead
 * of adding to them. Nothing here ends up in the build.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



declare module 'react' { // What: React Module Augmentation. Why: CSSProperties lives inside React's own module, so it can only be extended from within it. How: This reopens 'react' to merge into its CSSProperties interface.


	interface CSSProperties { // What: CSS Properties Interface. Why: A style object needs to accept custom properties alongside real ones. How: This merges an index signature for every name starting with two dashes.


		[ cusProStr : `--${ string }` ] : number | string | undefined; // What: Custom Property String. Why: Any custom property a module's CSS reads can be set from a style object. How: This allows every --name with a number or string value.


	}


}



export {}; // What: Empty Export. Why: The augmentation above only merges into React's types from inside a module. How: This empty export makes this file one.


