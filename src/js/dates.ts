const dateFormatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
});

/**
 * Return 'st', 'nd', 'rd', or 'th' to be appended to a given number
 */
function getOrdinalIndicator(n: number) {
    if (n > 10 && n <= 20) {
        return 'th';
    }

    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Return a formatted date string, e.g. 'January 6th'
 */
export function formatUTCDate(date: Date) {
    return dateFormatter.format(date) + getOrdinalIndicator(date.getUTCDate());
}

/**
 * Return the ISO date string for the Tuesday after `refDate`
 *
 * > getNextTuesdayISOString('2015-01-05'); // => '2015-01-06'
 * > getNextTuesdayISOString('2015-01-06'); // => '2015-01-13'
 * > getNextTuesdayISOString(new Date(2015, 0, 6)); // => '2015-01-13'
 * > getNextTuesdayISOString(new Date()); // The first Tuesday after today
 *
 * @param refDate - The reference date from which to search
 * If a `string`: An ISO string in *UTC* time, e.g. `'2015-01-06'`
 * If a `Date`: A Date object in *local* time, e.g. `new Date()`
 */
export function getNextTuesdayISOString(refDate: string | Date) {
    const WEEK = 7;
    const TUESDAY = 2;

    const utcRef = typeof refDate === 'string'
        ? new Date(refDate)
        : new Date(Date.UTC(
            refDate.getFullYear(), refDate.getMonth(), refDate.getDate()
        ));

    const dateOffset = (WEEK - (utcRef.getUTCDay() - TUESDAY)) % WEEK || WEEK;

    const utcResult = new Date(Date.UTC(
        utcRef.getUTCFullYear(),
        utcRef.getUTCMonth(),
        utcRef.getUTCDate() + dateOffset
    ));

    return utcResult.toISOString().slice(0, 10);
}
