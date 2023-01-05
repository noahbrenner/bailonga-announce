import * as ko from 'knockout';

import {getDaysTillEvent, getISOStringWithOffset} from './utils/dates';

export type ObservableDateString = ReturnType<typeof observableDateString>;

export function observableDateString(initialValue = '') {
    const date = ko.observable(initialValue);

    const self = ko.pureComputed({
        read: date,
        write: (newValue: string) => {
            const currentValue = date();

            if (currentValue === newValue) {
                // Don't make changes or notify subscribers
                return;
            } else if (newValue === '') {
                // Don't allow setting an empty string
                self.notifySubscribers(currentValue);
            } else {
                // Set to the nearest event date in the direction of the change
                const newDate = new Date(newValue);
                const isFuture = newValue > currentValue;
                const newISOString = getISOStringWithOffset(
                    newDate, getDaysTillEvent(newDate, isFuture)
                );
                date(newISOString);
            }
        }
    });

    return self;
}
