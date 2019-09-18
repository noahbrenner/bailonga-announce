import * as ko from 'knockout';

class ScheduleItem {
    public start = ko.observable('');
    public end = ko.observable('');
    public description = ko.observable('');

    constructor(
        public parent: ScheduleObservableArray,
        start: string,
        end: string,
        description: string
    ) {
        this.start.subscribe(() => this.parent.sortByStartTime());
        this.start(start); // e.g. '19:00'
        this.end(end); // e.g. '22:00'
        this.description(description);
    }

    public getStartTimeInSeconds() {
        // `Number` also returns 0 for the empty string, which is what we want
        return Number(this.start().split(':').join(''));
    }
}

type ScheduleObservableArray = ReturnType<typeof getScheduleObservableArray>;

export function getScheduleObservableArray() {
    const baseObservable = ko.observableArray([] as ScheduleItem[]);

    function add(
        this: ScheduleObservableArray,
        start = '',
        end = '',
        description = ''
    ) {
        this.push(new ScheduleItem(this, start, end, description));
    }

    function sortByStartTime(this: ScheduleObservableArray) {
        this.sort((left, right) => {
            return left.getStartTimeInSeconds() - right.getStartTimeInSeconds();
        });
    }

    const extensions = {
        add,
        sortByStartTime
    };

    return Object.assign(baseObservable, extensions) as (
        typeof baseObservable & typeof extensions
    );
}
