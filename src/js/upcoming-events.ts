import * as ko from 'knockout';

import {observableDateString, ObservableDateString} from './date-observable';
import {getNextTuesdayISOString} from './dates';

class UpcomingEvent {
    public date = observableDateString('');
    public title = ko.observable('');

    constructor(
        public parent: EventObservableArray,
        date: string,
        title: string
    ) {
        this.date.subscribe(() => this.parent.sortByDate());
        this.date(date);
        this.title(title);
    }

    public remove() {
        this.parent.remove(this);
    }
}

type EventObservableArray = ReturnType<typeof getEventObservableArray>;

export function getEventObservableArray(fallbackDate: ObservableDateString) {
    const baseObservable = ko.observableArray<UpcomingEvent>([]);

    function add(
        this: EventObservableArray,
        date = getNextTuesdayISOString(this.getLatestDate()),
        title = ''
    ) {
        this.push(new UpcomingEvent(this, date, title));
    }

    function getLatestDate(this: EventObservableArray) {
        const events = this();
        return events.length > 0
            ? events[events.length - 1].date()
            : fallbackDate();
    }

    function sortByDate(this: EventObservableArray) {
        this.sort((left, right) => {
            return Date.parse(left.date()) - Date.parse(right.date());
        });
    }

    const extensions = {
        add,
        getLatestDate,
        sortByDate
    };

    return Object.assign(baseObservable, extensions);
}
