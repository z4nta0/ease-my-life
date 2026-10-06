


/**
 * guard.ts = Guard
 *
 * @summary
 * Type guards for checks TypeScript can't read on its own. A built-in check
 * like Number.isInteger proves a value's type at runtime but tells the
 * compiler nothing, so a value it passed is still typed as possibly missing.
 * Each helper here runs the same check and declares what it proves, so code
 * reading the value afterwards narrows without an assertion.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region isaIntFun

/**
 * isaIntFun = Is-An Integer Function
 *
 * @summary
 * Whether a value is an integer, exactly as Number.isInteger reports it,
 * and, when it is, that the value is a number. Saved fields that may be
 * missing (a picker's anchor day, say) pass through here so the code
 * reading them afterwards knows they're numbers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param valAny - Value Any: The value to check, of any type.
 *
 * @returns Whether the value is an integer.
 *
 * @example
 * ```ts
 * isaIntFun(picLikObj.anchorDay) // => true or false
 * ```
 *
*/

const isaIntFun = ( valAny : unknown ) : valAny is number => Number.isInteger( valAny ); // What: Is-An Integer Function. Why: Number.isInteger proves a value is a number without telling TypeScript. How: This runs Number.isInteger and declares the value a number when it passes.

// #endregion isaIntFun



// #region isaTruFun

/**
 * isaTruFun = Is-A Truthy Function
 *
 * @summary
 * Whether a value is truthy, exactly as Boolean reports it, and, when it
 * is, that the value isn't null or undefined. An array filtered with a
 * bare Boolean still reads as holding nulls, so filtering through this
 * instead keeps Boolean's behavior while the array reads as holding only
 * real values.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param valAny - Value Any: The value to check, of any type.
 *
 * @returns Whether the value is truthy.
 *
 * @example
 * ```ts
 * chrMatArr.filter(isaTruFun) // => the matches without nulls
 * ```
 *
*/

const isaTruFun = < T >( valAny : T ) : valAny is NonNullable< T > => Boolean( valAny ); // What: Is-A Truthy Function. Why: Filtering with Boolean drops nulls without telling TypeScript. How: This runs Boolean and declares a passing value not null or undefined.

// #endregion isaTruFun

// #endregion Helpers



// #region Exports

export { isaIntFun, isaTruFun }; // What: Named Exports. Why: Code reading optional saved numbers or filtering out missing values narrows through these guards. How: This exports isaIntFun and isaTruFun by name.

// #endregion Exports


