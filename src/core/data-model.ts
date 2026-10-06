


// #region Imports

import type { PicUpdTyp } from './pickers.ts'; // What: Pick Update Type. Why: A pending Today entry stores the pick's item updates as is. How: This types EntPenTyp's updates field.

// #endregion Imports



/**
 * data-model.ts = Data Model
 *
 * @summary
 * The TypeScript types for the app's saved state: StaAppTyp, the whole state
 * object store.ts holds and storage.ts saves, and every record inside it, from
 * items, pickers, conditionals, and reminders to Today's entries, the five
 * history logs, and the settings for appearance, the daily generator,
 * holidays, reminders, onboarding, and the UI, plus the fixed value sets
 * several fields draw from. They live in core/ because core/ is the lowest
 * layer that reads these records, and nothing below it may import from state/.
 * Every field name is the one saved in user data, so none of them follow the
 * naming rule; renaming them waits for the persisted-name migration. Fields
 * only some records carry, such as the ease band on items outside the ease
 * modes, are optional.
 *
 * Sections:
 *  - Types
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type CadNamTyp = 'daily' | 'monthly' | 'weekly' | 'yearly';                   // What: Cadence Name Type. Why: A picker surfaces on one of four schedules. How: This lists every cadence a picker's own cadence field can hold.
type CheStaTyp = 'cancelled' | 'finished' | 'pending' | 'skipped';            // What: Checklist Status Type. Why: Each onboarding step and App Features tutorial ends one of a few ways. How: This lists every status onboarding records.
type DatModTyp = 'date' | 'nthWeekday';                                       // What: Date Mode Type. Why: A monthly or yearly schedule falls either on a day of the month or on the Nth weekday. How: This lists both dateMode values.
type EntKinTyp = 'charging' | 'dayoff';                                       // What: Entry Kind Type. Why: Two kinds of Today card aren't ordinary picks. How: This lists them; an ordinary pick has no kind.
type ModNamTyp = 'dynamic' | 'ease-down' | 'ease-up' | 'random' | 'weighted'; // What: Mode Name Type. Why: Pickers and conditionals share the same five ways of choosing. How: This lists every mode either one's own mode field can hold.
type PclOutTyp = 'rejected' | 'skipped';                                      // What: Pick-Log Outcome Type. Why: A pick that never counted as done records why. How: This lists both values a pick-log row's own optional outcome can hold.
type PclSouTyp = 'auto' | 'manual' | 'reroll';                                // What: Pick-Log Source Type. Why: Stats breaks picks down by how each one was made. How: This lists every source a pick-log row records.
type RemKinTyp = 'once' | 'recurring';                                        // What: Reminder Kind Type. Why: Reminder logs split one-time from recurring reminders. How: This lists both classes.
type RepNamTyp = 'annual' | 'interval' | 'monthly' | 'once' | 'weekly';       // What: Repeat Name Type. Why: A reminder either happens once or repeats on one of four patterns. How: This lists every value a task's own repeat field can hold.



type CdlRowTyp = { // What: Conditional-Log Row Type. Why: Stats charts how often each conditional triggered. How: This describes one entry of state.conditionalLog.


	condId    : string;    // What: Conditional Id. Why: A row belongs to one conditional. How: This is its id.
	date      : string;    // What: Date. Why: Stats groups rows by day. How: This is the 'YYYY-MM-DD' day it was resolved for.
	id        : string;    // What: Id. Why: Every row needs its own identity. How: This is its unique identifier.
	mode      : ModNamTyp; // What: Mode. Why: The row has to read correctly after the conditional changes mode. How: This copies its mode at the time.
	name      : string;    // What: Name. Why: The row has to read correctly after a rename or delete. How: This copies the conditional's name at the time.
	triggered : boolean;   // What: Triggered. Why: Stats counts days off. How: This is true when the conditional triggered that day.


};



type ConRcdTyp = { // What: Conditional Record Type. Why: A conditional is the day-off gate that can suppress its dependent pickers for a day. How: This describes one entry of state.conditionals.


	_cardPrev?   : { chargeStep? : number, triggered : boolean, value : number };                         // What: Card Previous. Why: Unchecking a completed day-off card has to restore exactly what checking it changed. How: This snapshots those fields, removed again on restore.
	_chargePrev? : { chargedToday : boolean, chargeStep? : number, triggered : boolean, value : number }; // What: Charge Previous. Why: Unchecking the completion that charged a conditional has to undo that charge. How: This snapshots the charge fields, removed again on restore.
	active       : boolean;                                                                               // What: Active. Why: A paused conditional never triggers. How: This is false while the user has it switched off.
	cardText     : string;                                                                                // What: Card Text. Why: A triggered conditional shows a day-off card on Today. How: This is that card's own text.
	chargedToday : boolean;                                                                               // What: Charged Today. Why: An ease conditional charges at most once per day. How: This is true once today's first dependent completion has charged it.
	chargeStep?  : number;                                                                                // What: Charge Step. Why: The ease modes move a conditional by a fixed planned step each cycle. How: This holds that step, absent until one is rolled.
	easeMax      : number;                                                                                // What: Ease Max. Why: The ease modes need an upper drift bound. How: This is the largest step a cycle can roll.
	easeMin      : number;                                                                                // What: Ease Min. Why: The ease modes need a lower drift bound. How: This is the smallest step a cycle can roll.
	id           : string;                                                                                // What: Id. Why: Pickers and log rows refer to a conditional by it. How: This is its stable identifier.
	mode         : ModNamTyp;                                                                             // What: Mode. Why: A conditional decides whether to trigger in one of the five picker ways. How: This names which.
	name         : string;                                                                                // What: Name. Why: The conditional is listed and logged by name. How: This is the user's own label for it.
	oddsPct      : number;                                                                                // What: Odds Percent. Why: The random mode triggers with a fixed chance. How: This is that chance, 0 to 100.
	threshold    : number;                                                                                // What: Threshold. Why: The ease and dynamic modes trigger once value crosses a line. How: This is that line, normally 100.
	triggered    : boolean;                                                                               // What: Triggered. Why: Today's generation needs to know whether the gate is closed. How: This is true while the conditional suppresses its pickers.
	value        : number;                                                                                // What: Value. Why: The ease and dynamic modes track their own drifting charge. How: This holds that charge.
	weight       : number;                                                                                // What: Weight. Why: The weighted modes scale the trigger chance. How: This is that weight.


};



type CusPalTyp = { // What: Custom Palette Type. Why: A custom theme is built from three chosen colors. How: This describes appearance.customLight or appearance.customDark.


	accent       : string;  // What: Accent. Why: Actions and selection use the accent color. How: This is that color as hex.
	bg           : string;  // What: Background. Why: The page sits on the background color. How: This is that color as hex.
	derived?     : boolean; // What: Derived. Why: Editing one custom theme fills in the other by inverting it. How: This is true on the filled-in one until edited directly, and absent on a slot that has only been renamed.
	name?        : string;  // What: Name. Why: A user can rename their custom theme. How: This is the name, absent until renamed.
	nameDerived? : boolean; // What: Name Derived. Why: Renaming one custom theme also names the other, unless that one was named directly. How: This is true on a copied name and false on a direct one.
	text         : string;  // What: Text. Why: Body text uses the text color. How: This is that color as hex.


};



type AppSetTyp = { // What: Appearance Settings Type. Why: The theme, animations, and tab bar placement are the user's to choose. How: This describes state.appearance.


	autoSystem      : boolean;          // What: Auto System. Why: The theme can follow the device's light or dark mode. How: This is true while it does.
	completionStyle : string;           // What: Completion Style. Why: Finishing the day plays the celebration the user picked. How: This names it, e.g. 'confetti'.
	customDark      : CusPalTyp | null; // What: Custom Dark. Why: A user can build their own dark theme. How: This holds it, or null until set up.
	customLight     : CusPalTyp | null; // What: Custom Light. Why: A user can build their own light theme. How: This holds it, or null until set up.
	pickAnim        : string;           // What: Pick Animation. Why: A pick plays the animation the user picked. How: This names it, e.g. 'reel'.
	tabPlacement    : string;           // What: Tab Placement. Why: The tab bar can sit at the bottom, top, or side. How: This names where.
	theme           : string;           // What: Theme. Why: The app is drawn in the user's chosen palette. How: This names it, e.g. 'ink' or 'customDark'.


};



type DaiSetTyp = { // What: Daily Settings Type. Why: The daily generator runs chosen pickers at a chosen time. How: This describes state.daily.


	mode      : string;   // What: Mode. Why: The list can generate automatically or only on request. How: This names which, e.g. 'auto'.
	pickerIds : string[]; // What: Picker Ids. Why: Only chosen pickers join the daily list. How: This lists their ids.
	runTime   : string;   // What: Run Time. Why: The automatic run happens at a set time. How: This is that time as 'HH:MM'.


};



type HolCusTyp = { day : number, id : string, month : number, name : string }; // What: Holiday Custom Type. Why: A user can add their own recurring days off. How: This describes one entry of state.holidays.custom, falling on day of month every year.



type HolStaTyp = { // What: Holiday State Type. Why: Reminders and pickers that skip holidays need to know which days count. How: This describes state.holidays.


	country  : string;      // What: Country. Why: Holidays are computed from one region's rule table. How: This is the region code, 'US' today.
	custom   : HolCusTyp[]; // What: Custom. Why: The user's own days off join the computed ones. How: This lists them.
	disabled : string[];    // What: Disabled. Why: A user can switch individual computed holidays off. How: This lists their keys.


};



type IteRcdTyp = { // What: Item Record Type. Why: An item is one choice in a picker's pool, chores, meals, or anything else. How: This describes one entry of state.items.


	chargeStep? : number;        // What: Charge Step. Why: An ease item charges or drains by a fixed planned step. How: This holds that step, absent until one is rolled.
	easeMax?    : number;        // What: Ease Max. Why: An ease item has its own drift band. How: This is the band's upper bound, absent outside the ease modes.
	easeMin?    : number;        // What: Ease Min. Why: An ease item has its own drift band. How: This is the band's lower bound, absent outside the ease modes.
	id          : string;        // What: Id. Why: Today entries and log rows refer to an item by it. How: This is its stable identifier.
	lastPicked  : string | null; // What: Last Picked. Why: Ties break toward the item picked longest ago. How: This is the last pick's ISO timestamp, or null if never picked.
	name        : string;        // What: Name. Why: The item is shown and logged by name. How: This is the user's own label for it.
	pickerId    : string;        // What: Picker Id. Why: A picker's pool is every item pointing at it. How: This is the owning picker's id.
	picks       : number;        // What: Picks. Why: Stats and the pickers count how often an item came up. How: This is its running pick count.
	vacation    : boolean;       // What: Vacation. Why: A deactivated item stays saved but is never picked. How: This is true while the item is switched off.
	value       : number;        // What: Value. Why: The dynamic and ease modes track a drifting charge per item. How: This holds that charge.
	weight      : number;        // What: Weight. Why: The weighted modes favor heavier items. How: This is the item's own weight.


};



type EntRevTyp = { // What: Entry Revert Type. Why: Unchecking a completed entry has to undo exactly what completing it did. How: This describes the snapshot taken when entry.pending was applied, entry.revert.


	activeItemId?  : string | null;                                                                          // What: Active Item Id. Why: An applied picker patch may have moved the active item. How: This holds the picker's previous one.
	items          : Pick< IteRcdTyp, 'chargeStep' | 'id' | 'lastPicked' | 'picks' | 'value' | 'weight' >[]; // What: Items. Why: Every touched item needs its old values back. How: This holds each one's fields as they were.
	lastRunPeriod? : string | null;                                                                          // What: Last Run Period. Why: A non-daily run records its period on completion. How: This holds the picker's previous one.
	pickerId       : string | null;                                                                          // What: Picker Id. Why: The undo has to know which picker to restore. How: This is the entry's picker id.


};



type OnbStaTyp = { // What: Onboarding State Type. Why: The tours and setup checklist remember where the user is. How: This describes state.onboarding.


	activeTour                  : { id : string, step : number } | null;    // What: Active Tour. Why: A reload resumes a running tour. How: This holds its id and step, or null.
	appFeatures                 : Record< string, { status : CheStaTyp } >; // What: App Features. Why: Each App Features tutorial is done, skipped, or still open. How: This maps each feature id to its status.
	appFeaturesEverCompleted?   : boolean;                                  // What: App Features Ever Completed. Why: The section's celebration plays only once. How: This is true once every feature has been resolved.
	appFeaturesIntroSeen        : boolean;                                  // What: App Features Intro Seen. Why: The section's intro shows only once. How: This is true once seen.
	appFeaturesSectionResolved? : boolean;                                  // What: App Features Section Resolved. Why: A finished section leaves Today. How: This is true once it has.
	checklist                   : Record< string, { status : CheStaTyp } >; // What: Checklist. Why: Each setup step and sample is done, skipped, or still open. How: This maps each step id to its status.
	checklistDone               : boolean;                                  // What: Checklist Done. Why: A finished checklist leaves Today. How: This is true once it has.
	dismissed                   : boolean;                                  // What: Dismissed. Why: The user can wave onboarding away. How: This is true once they have.
	generateScrollPending       : boolean;                                  // What: Generate Scroll Pending. Why: The first generated list scrolls into view once. How: This is true until it has.
	pageToursName               : string;                                   // What: Page Tours Name. Why: The page tours' group shows under a name. How: This is that name.
	welcomed                    : boolean;                                  // What: Welcomed. Why: The welcome modal shows only to a new user. How: This is true once shown.


};



type PclRowTyp = { // What: Pick-Log Row Type. Why: Stats is built from a flat history of every pick. How: This describes one entry of state.pickLog, with names copied in so the row survives a rename or delete.


	completedAt  : string | null; // What: Completed At. Why: Stats measures when picks were actually done. How: This is the completion's ISO timestamp, or null.
	date         : string;        // What: Date. Why: Stats groups picks by calendar day. How: This is the pick's 'YYYY-MM-DD' day.
	depletedEnd? : boolean;       // What: Depleted End. Why: An Ease Down streak ends when its item runs out. How: This is true on the row that ended one.
	done         : boolean;       // What: Done. Why: Stats separates finished picks from open ones. How: This is true once the pick was checked off.
	eid          : string | null; // What: Entry Identifier. Why: A row links back to its live Today entry until the day rolls. How: This is that entry's id, or null.
	group        : string;        // What: Group. Why: Stats filters by group. How: This copies the picker's group at pick time.
	id           : string;        // What: Id. Why: Every row needs its own identity. How: This is its unique identifier.
	itemId       : string;        // What: Item Id. Why: Stats groups rows by item. How: This is the picked item's id.
	itemName     : string;        // What: Item Name. Why: The row has to read correctly after the item is renamed or deleted. How: This copies the item's name at pick time.
	outcome?     : PclOutTyp;     // What: Outcome. Why: A pick that never counted needs its reason. How: This names it, absent on an ordinary pick.
	pickerId     : string;        // What: Picker Id. Why: Stats groups rows by picker. How: This is the owning picker's id.
	pickerName   : string;        // What: Picker Name. Why: The row has to read correctly after the picker is renamed or deleted. How: This copies the picker's name at pick time.
	source       : PclSouTyp;     // What: Source. Why: Stats breaks picks down by how they were made. How: This names the source.


};



type PicRcdTyp = { // What: Picker Record Type. Why: A picker is a pool of items chosen from on a schedule. How: This describes one entry of state.pickers.


	activeItemId?      : string | null; // What: Active Item Id. Why: Ease Down keeps one item active until it runs out. How: This is that item's id, or null between streaks.
	anchorDay          : number;        // What: Anchor Day. Why: A yearly picker runs on one day of the month. How: This is that day, 1 through 31.
	anchorDom          : number;        // What: Anchor Day Of Month. Why: A monthly picker runs on one day of the month. How: This is that day, 1 through 31.
	anchorDow          : number;        // What: Anchor Day Of Week. Why: A weekly picker runs on one weekday. How: This is that weekday, 0 for Sunday.
	anchorMonth        : number;        // What: Anchor Month. Why: A yearly picker runs in one month. How: This is that month, 1 through 12.
	avoidDuplicates    : boolean;       // What: Avoid Duplicates. Why: A picker can refuse to pick an item already on today's list. How: This is true when it does.
	cadence            : CadNamTyp;     // What: Cadence. Why: A picker surfaces on a schedule. How: This names which.
	conditionalId      : string | null; // What: Conditional Id. Why: A picker can be suppressed by a day-off conditional. How: This is that conditional's id, or null.
	createdFromSample? : string;        // What: Created From Sample. Why: A tour's replay has to find the picker it made before. How: This is the sample's id, absent on the user's own pickers.
	dateMode?          : DatModTyp;     // What: Date Mode. Why: A monthly or yearly picker falls on a day of the month or on the Nth weekday. How: This names which, absent meaning a day of the month.
	daysOfWeek         : number[];      // What: Days Of Week. Why: A picker can be limited to certain weekdays. How: This lists them, 0 for Sunday.
	easeMax            : number;        // What: Ease Max. Why: New ease items take the picker's default drift band. How: This is the band's upper bound.
	easeMin            : number;        // What: Ease Min. Why: New ease items take the picker's default drift band. How: This is the band's lower bound.
	group              : string;        // What: Group. Why: Today clusters pickers into groups. How: This is the group's label.
	hidden             : boolean;       // What: Hidden. Why: Sample pickers stay saved but out of sight until a tour shows them. How: This is true while hidden.
	id                 : string;        // What: Id. Why: Items, entries, and log rows refer to a picker by it. How: This is its stable identifier.
	lastRunPeriod?     : string | null; // What: Last Run Period. Why: A non-daily picker counts as run for its period once its card is completed. How: This is the completed period's start date, absent until one completes, and null once an undo restores a picker that had never run.
	mode               : ModNamTyp;     // What: Mode. Why: A picker chooses in one of five ways. How: This names which.
	name               : string;        // What: Name. Why: The picker is shown by name. How: This is the user's own label for it.
	nthOrdinal?        : number;        // What: Nth Ordinal. Why: An Nth-weekday schedule needs which occurrence. How: This is 1 through 5.
	nthWeekday?        : number;        // What: Nth Weekday. Why: An Nth-weekday schedule needs which weekday. How: This is 0 for Sunday through 6.
	skipHolidays       : boolean;       // What: Skip Holidays. Why: A picker can sit out holidays. How: This is true when it does.
	threshold          : number;        // What: Threshold. Why: Ease items become eligible or run out at a line. How: This is that line, normally 100.


};



type PicArgTyp = Partial< PicRcdTyp > & { includeInDaily? : boolean, items? : Partial< IteRcdTyp >[], newConditional? : Partial< ConRcdTyp > | null, replaceId? : string, step? : number }; // What: Picker Argument Type. Why: Adding, editing, or prefilling a picker passes the form's fields, its items, and any new conditional together. How: This is a partial picker plus whether it joins the daily list, its items, a new conditional, the id of a sample it replaces, and the create form step a tour prefill opens on.



type PicForTyp = Omit< PicArgTyp, 'items' > & Pick< PicRcdTyp, 'group' | 'mode' | 'name' > & { items? : ( Partial< IteRcdTyp > & Pick< IteRcdTyp, 'name' > )[] }; // What: Picker Form Type. Why: Adding or saving a picker builds a real picker from the form, which always names it, groups it, and picks its mode. How: This is a picker argument whose group, mode, name, and item names are required.



type EntPenTyp = { // What: Entry Pending Type. Why: A pick's effects wait until its entry is checked off, so nothing changes for a pick the user never does. How: This describes an entry's staged effects, entry.pending.


	bumpPick?    : boolean;              // What: Bump Pick. Why: A completed pick counts toward its item's picks and lastPicked. How: This is true when completing should bump them.
	depletedEnd? : boolean;              // What: Depleted End. Why: An Ease Down streak that runs out is marked on its log row. How: This is true when completing ends one.
	pickedId?    : string;               // What: Picked Id. Why: The bump applies to the item actually picked. How: This is that item's id.
	pickerPatch? : Partial< PicRcdTyp >; // What: Picker Patch. Why: Ease Down tracks its active item on the picker. How: This holds that picker update.
	updates      : PicUpdTyp[];          // What: Updates. Why: A pick can change other items' charge or weight. How: This lists every change to apply on completion.


};



type RemClaTyp = { // What: Reminder Class Type. Why: One-time and recurring reminders each have their own switches. How: This describes one class's options, state.reminderOpts.once or .recurring.


	excludeHolidays : boolean; // What: Exclude Holidays. Why: A class can sit out holidays. How: This hides its reminders on a holiday when true.
	excludeWeekends : boolean; // What: Exclude Weekends. Why: A class can sit out weekends. How: This hides its reminders on Saturday and Sunday when true.
	ring            : boolean; // What: Ring. Why: A class can count toward Today's progress ring or not. How: This includes it when true.
	stats           : boolean; // What: Stats. Why: A class can count toward Stats or not. How: This includes it when true.
	streak          : boolean; // What: Streak. Why: A class can count toward the day streak or not. How: This includes it when true.


};



type RemOptTyp = { once : RemClaTyp, recurring : RemClaTyp }; // What: Reminder Options Type. Why: Reminders follow per-class switches set in Settings. How: This describes state.reminderOpts, one RemClaTyp per class.



type RmlRowTyp = { // What: Reminder-Log Row Type. Why: Stats counts completed reminders. How: This describes one entry of state.reminderLog, with the name copied in so it survives a rename or delete.


	completedAt : string;    // What: Completed At. Why: Stats places a completion in time. How: This is its ISO timestamp.
	name        : string;    // What: Name. Why: The row has to read correctly after a rename or delete. How: This copies the reminder's name at the time.
	rowId       : string;    // What: Row Id. Why: Every row needs its own identity. How: This is its unique identifier.
	taskId      : string;    // What: Task Id. Why: A row belongs to one reminder. How: This is its id.
	type        : RemKinTyp; // What: Type. Why: Stats splits one-time from recurring reminders. How: This names which.


};



type RslRowTyp = { // What: Reminder-Skip-Log Row Type. Why: Stats counts skipped reminders. How: This describes one entry of state.reminderSkipLog.


	name      : string;    // What: Name. Why: The row has to read correctly after a rename or delete. How: This copies the reminder's name at the time.
	rowId     : string;    // What: Row Id. Why: Every row needs its own identity. How: This is its unique identifier.
	skippedAt : string;    // What: Skipped At. Why: Stats places a skip in time. How: This is its ISO timestamp.
	taskId    : string;    // What: Task Id. Why: A row belongs to one reminder. How: This is its id.
	type      : RemKinTyp; // What: Type. Why: Stats splits one-time from recurring reminders. How: This names which.


};



type TasRcdTyp = { // What: Task Record Type. Why: A reminder is a scheduled task, separate from the randomly picked items. How: This describes one entry of state.tasks.


	anchor             : string;        // What: Anchor. Why: Interval and annual reminders count their repeats from a starting day. How: This is that 'YYYY-MM-DD' day.
	createdAt          : string;        // What: Created At. Why: A reminder can't be due before it existed. How: This is its creation's ISO timestamp.
	createdFromSample? : string;        // What: Created From Sample. Why: A tour's replay has to find the reminder it made before. How: This is the sample's id, absent on the user's own reminders.
	dateMode           : DatModTyp;     // What: Date Mode. Why: A monthly or annual reminder falls on a day of the month or on the Nth weekday. How: This names which.
	day                : number;        // What: Day. Why: An annual reminder falls on one day of its month. How: This is that day, 1 through 31.
	dayOfMonth         : number;        // What: Day Of Month. Why: A monthly reminder falls on one day of the month. How: This is that day, 1 through 31.
	daysOfWeek         : number[];      // What: Days Of Week. Why: A weekly reminder falls on chosen weekdays. How: This lists them, 0 for Sunday.
	hidden             : boolean;       // What: Hidden. Why: Sample reminders stay saved but out of sight until a tour shows them. How: This is true while hidden.
	id                 : string;        // What: Id. Why: Log rows refer to a reminder by it. How: This is its stable identifier.
	interval           : number;        // What: Interval. Why: Interval and annual reminders repeat every N days or years. How: This is N.
	lastDone           : string | null; // What: Last Done. Why: A reminder done today shouldn't show again until it's next due. How: This is the last completion's day, or null.
	month              : number;        // What: Month. Why: An annual reminder falls in one month. How: This is that month, 1 through 12.
	name               : string;        // What: Name. Why: The reminder is shown and logged by name. How: This is the user's own label for it.
	nthOrdinal         : number;        // What: Nth Ordinal. Why: An Nth-weekday schedule needs which occurrence. How: This is 1 through 5.
	nthWeekday         : number;        // What: Nth Weekday. Why: An Nth-weekday schedule needs which weekday. How: This is 0 for Sunday through 6.
	onceDate?          : string;        // What: Once Date. Why: A one-time reminder falls on a single day. How: This is that 'YYYY-MM-DD' day, absent on repeating reminders.
	repeat             : RepNamTyp;     // What: Repeat. Why: A reminder happens once or repeats on a pattern. How: This names which.
	skipUntil          : string | null; // What: Skip Until. Why: A skipped reminder stays away until a set day. How: This is that day, or null.


};



type TasArgTyp = Partial< TasRcdTyp > & { replaceId? : string }; // What: Task Argument Type. Why: Adding a reminder passes the editor's fields. How: This is a partial reminder plus the id of a sample it replaces.



type TodEntTyp = { // What: Today Entry Type. Why: Each card on Today is one entry, a pick or a day-off card. How: This describes one entry of state.today.entries.


	cardText?      : string;           // What: Card Text. Why: A day-off card shows its conditional's text. How: This is that text, day-off cards only.
	condName?      : string;           // What: Conditional Name. Why: A day-off card names its conditional. How: This copies the name, day-off cards only.
	conditionalId? : string | null;    // What: Conditional Id. Why: Completing a day-off card resets its conditional. How: This is its id, day-off cards only, or null when the generator gave none.
	done           : boolean;          // What: Done. Why: The card can be checked off. How: This is true once it is.
	eid            : string;           // What: Entry Identifier. Why: Log rows and edits refer to an entry by it. How: This is its unique id.
	group?         : string;           // What: Group. Why: A card without a picked item still sits in its picker's group. How: This copies the group, on charging and day-off cards.
	itemId         : string | null;    // What: Item Id. Why: A pick card shows its item. How: This is the item's id, or null on a card without one.
	kind?          : EntKinTyp;        // What: Kind. Why: Charging and day-off cards render differently from picks. How: This names the kind, absent on an ordinary pick.
	pending        : EntPenTyp | null; // What: Pending. Why: A pick's effects wait until it's checked off. How: This holds them, or null.
	periodKey?     : string;           // What: Period Key. Why: A non-daily pick belongs to one period. How: This is that period's start day.
	pickerId       : string | null;    // What: Picker Id. Why: A card belongs to one picker. How: This is its id, or null on a card without one.
	pickerName?    : string;           // What: Picker Name. Why: A day-off card names its picker. How: This copies the name, day-off cards only.
	revert         : EntRevTyp | null; // What: Revert. Why: Unchecking undoes what checking applied. How: This holds that snapshot, or null.
	skipped        : boolean;          // What: Skipped. Why: A card can be skipped for the day. How: This is true once it is.


};



type TodStaTyp = { // What: Today State Type. Why: Today's list is generated once per day and kept. How: This describes state.today.


	entries       : TodEntTyp[];                                                                          // What: Entries. Why: The list is made of cards. How: This lists them in order.
	generatedAt   : string | null;                                                                        // What: Generated At. Why: The list is generated at most once a day. How: This is the last generation's ISO timestamp.
	genLog?       : { conds : Record< string, Partial< ConRcdTyp > >, items : Record< string, number > }; // What: Generation Log. Why: The Day Log shows each item's and conditional's state at generation. How: This snapshots them, keyed by id.
	streakClaimed : boolean;                                                                              // What: Streak Claimed. Why: A finished day counts toward the streak once. How: This is true once today has.


};



type UiStaTyp = { // What: UI State Type. Why: A few display choices persist between visits. How: This describes state.ui.


	controlsCollapsed : Record< string, boolean >; // What: Controls Collapsed. Why: Data tab sections stay as the user left them. How: This maps each section key to whether it's collapsed.
	dataSort?         : Record< string, string >;  // What: Data Sort. Why: Each Data tab list keeps its chosen sort. How: This maps each list to its sort key.


};



type VclRowTyp = { // What: Vacation-Log Row Type. Why: Stats leaves days an item was deactivated out of its numbers. How: This describes one entry of state.vacationLog.


	date   : string;  // What: Date. Why: A switch happens on a day. How: This is that 'YYYY-MM-DD' day.
	itemId : string;  // What: Item Id. Why: A row belongs to one item. How: This is its id.
	on     : boolean; // What: On. Why: An item can be switched off and back on. How: This is true when it was deactivated.


};



type StaAppTyp = { // What: State App Type. Why: The whole app runs on one saved state object. How: This describes it, as store.ts holds it and storage.ts saves it.


	_easeDownWeightsInit? : boolean;                    // What: Ease Down Weights Init. Why: A one-time migration seeded Ease Down's fairness weights. How: This is true once it has run.
	_remStatsDefaultOn?   : boolean;                    // What: Reminder Stats Default On. Why: A one-time migration turned reminder stats on. How: This is true once it has run.
	_taskIntervalReset?   : boolean;                    // What: Task Interval Reset. Why: A one-time migration reset stale reminder intervals. How: This is true once it has run.
	appearance            : AppSetTyp;                  // What: Appearance. Why: The user's theme and display choices. How: This holds them.
	conditionalLog        : CdlRowTyp[];                // What: Conditional Log. Why: Stats charts conditionals over time. How: This holds every row.
	conditionals          : ConRcdTyp[];                // What: Conditionals. Why: Day-off gates suppress pickers. How: This lists them.
	daily                 : DaiSetTyp;                  // What: Daily. Why: The generator runs on a schedule. How: This holds its settings.
	groupOrder            : string[];                   // What: Group Order. Why: Today shows groups in the user's order. How: This lists group names in order.
	holidays              : HolStaTyp;                  // What: Holidays. Why: Holiday skipping needs the user's holiday settings. How: This holds them.
	items                 : IteRcdTyp[];                // What: Items. Why: Every picker's pool lives here. How: This lists every item.
	onboarding            : OnbStaTyp;                  // What: Onboarding. Why: Tours and the checklist remember progress. How: This holds it.
	pickerOrder           : Record< string, string[] >; // What: Picker Order. Why: Pickers show in the user's order within each group. How: This maps each group name to its picker ids in order.
	pickers               : PicRcdTyp[];                // What: Pickers. Why: Pickers choose what to do. How: This lists them.
	pickLog               : PclRowTyp[];                // What: Pick Log. Why: Stats charts picks over time. How: This holds every row.
	reminderLog           : RmlRowTyp[];                // What: Reminder Log. Why: Stats counts completed reminders. How: This holds every row.
	reminderOpts          : RemOptTyp;                  // What: Reminder Options. Why: Reminders follow per-class switches. How: This holds them.
	reminderSkipLog       : RslRowTyp[];                // What: Reminder Skip Log. Why: Stats counts skipped reminders. How: This holds every row.
	streak                : number;                     // What: Streak. Why: Finishing days in a row builds a streak. How: This is its length in days.
	tasks                 : TasRcdTyp[];                // What: Tasks. Why: Reminders are scheduled tasks. How: This lists them.
	today                 : TodStaTyp;                  // What: Today. Why: Today's list is kept for the day. How: This holds it.
	ui                    : UiStaTyp;                   // What: UI. Why: A few display choices persist. How: This holds them.
	v                     : number;                     // What: Version. Why: The saved shape changes over time. How: This is the save format's version.
	vacationLog           : VclRowTyp[];                // What: Vacation Log. Why: Stats leaves deactivated days out. How: This holds every row.


};

// #endregion Types



// #region Exports

export { type AppSetTyp, type CadNamTyp, type CdlRowTyp, type CheStaTyp, type ConRcdTyp, type CusPalTyp, type DaiSetTyp, type DatModTyp, type EntKinTyp, type EntPenTyp, type EntRevTyp, type HolCusTyp, type HolStaTyp, type IteRcdTyp, type ModNamTyp, type OnbStaTyp, type PclOutTyp, type PclRowTyp, type PclSouTyp, type PicArgTyp, type PicForTyp, type PicRcdTyp, type RemClaTyp, type RemKinTyp, type RemOptTyp, type RepNamTyp, type RmlRowTyp, type RslRowTyp, type StaAppTyp, type TasArgTyp, type TasRcdTyp, type TodEntTyp, type TodStaTyp, type UiStaTyp, type VclRowTyp }; // What: Named Type Exports. Why: core/, state/, and the UI all read the same saved records. How: This exports every record type and value set by name, each marked type so it disappears from the build.

// #endregion Exports


