import * as ko from 'knockout';

import {getNextTuesdayISOString} from './dates';

class UpcomingEvent {
    public date = ko.observable('');
    public title = ko.observable('');

    constructor(
        public parent: ReturnType<typeof getEventObservableArray>,
        date: string
    ) {
        // TODO If date is '', reset to default, then sort
        this.date.subscribe(() => this.parent.sortByDate());
        this.date(date);
    }

    public remove() {
        this.parent.remove(this);
    }
}

export function getEventObservableArray(fallbackDate: ko.Observable<string>) {
    const baseObservable = ko.observableArray([] as UpcomingEvent[]);

    type EventObservableArray = typeof baseObservable & typeof extensions;

    function add(this: EventObservableArray) {
        const defaultDate = getNextTuesdayISOString(this.getLatestDate());
        this.push(new UpcomingEvent(this, defaultDate));
    }

    function getLatestDate(this: EventObservableArray) {
        if (this().length > 0) {
            const lastUpcomingEvent = this()[this().length - 1];
            return lastUpcomingEvent.date();
        } else if (fallbackDate() !== '') {
            return fallbackDate();
        } else {
            return getNextTuesdayISOString(new Date());
        }
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

    return Object.assign(baseObservable, extensions) as EventObservableArray;
}
