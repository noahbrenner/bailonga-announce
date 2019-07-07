import * as ko from 'knockout';

import '../css/styles.scss';
import facebook from '../templates/facebook.ejs.txt';
import {observableDateString} from './date-observable';
import {formatUTCDate, getNextTuesdayISOString} from './dates';
import {getEventObservableArray} from './upcoming-events';

type InputProperty = Extract<keyof ViewModel,
    'title' | 'date' | 'intro' |
    'dj' | 'musicType' |
    'teacherBeginner' | 'topicBeginner' |
    'teacherIntermediate' | 'topicIntermediate' |
    'cost'
>;

class ViewModel {
    public title = ko.observable('');
    public date = observableDateString('');
    public intro = ko.observable('');
    public dj = ko.observable('');
    public musicType = ko.observable('');
    public teacherBeginner = ko.observable('');
    public topicBeginner = ko.observable('');
    public teacherIntermediate = ko.observable('');
    public topicIntermediate = ko.observable('');
    public cost = ko.observable('');
    public upcomingEvents = getEventObservableArray(this.date);

    public musicTypeOptions: readonly string[] = [
        '50/50 Alternative and Traditional',
        '100% Traditional',
        '100% Alternative',
        'First 3/4 traditional, last 1/4 alternative',
        'Tango/Blues-Fusion alternative mix'
        // TODO 'Other' (and add a text box)
    ];

    public topicBeginnerOptions: readonly string[] = [
        'Week 1: From zero, the very basics.',
        'Week 2: Musicality',
        'Week 3: Molinete',
        'Week 4: Cross System',
        'Week 5: Bonus Topic TBA'
    ];

    public facebook = ko.pureComputed(() => facebook(this.templateLocals()));

    private templateLocals = ko.pureComputed(() => ({
        title: this.title().trim(),
        date: formatUTCDate(new Date(this.date())),
        intro: this.intro().trim(),
        dj: this.dj().trim(),
        musicType: this.musicType(),
        teacherBeginner: this.teacherBeginner().trim(),
        topicBeginner: this.topicBeginner(),
        teacherIntermediate: this.teacherIntermediate().trim(),
        topicIntermediate: this.topicIntermediate().trim(),
        cost: this.cost().trim(),
        upcomingEvents: this.upcomingEvents().map((event) => ({
            date: formatUTCDate(new Date(event.date())),
            title: event.title().trim()
        }))
    }));

    constructor() {
        // Update the default beginner topic whenever the event date changes
        this.date.subscribe((newDateString) => {
            const utcDate = new Date(newDateString);
            const weekIndex = Math.floor((utcDate.getUTCDate() - 1) / 7);
            this.topicBeginner(this.topicBeginnerOptions[weekIndex]);
        });

        // Initialize default values
        Object.entries(this.getDefaultValues())
            .forEach(([key, val]) => this[key as InputProperty](val));
    }

    public addUpcomingEvent() {
        this.upcomingEvents.add();
    }

    private getDefaultValues() {
        const result = {
            date: getNextTuesdayISOString(new Date()),
            topicIntermediate: 'TBD',
            cost: '$7 – $10'
        };

        return result as (
            Pick<Record<InputProperty, string>, keyof typeof result>
        ) as typeof result;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
} else {
    ko.applyBindings(new ViewModel());
}
