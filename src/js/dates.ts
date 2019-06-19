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
 * Return the ISO date for the soonest Tuesday (maybe today), e.g. '2015-01-06'
 */
export function getNextTuesdayDateString() {
    const TUESDAY = 2;
    const now = new Date();
    const utcDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDay = utcDate.getUTCDay();

    if (currentDay !== TUESDAY) {
        const dateOffset = 7 - ((utcDate.getDay() - TUESDAY + 7) % 7);
        utcDate.setUTCDate(utcDate.getUTCDate() + dateOffset);
    }

    return utcDate.toISOString().slice(0, 10);
}
