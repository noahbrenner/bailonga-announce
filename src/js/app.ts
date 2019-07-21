import * as ko from 'knockout';

import '../css/styles.scss';
import etango from '../templates/etango.ejs.html';
import eugeneTango from '../templates/eugenetango.ejs.html';
import facebook from '../templates/facebook.ejs.txt';
import {observableDateString} from './date-observable';
import {formatUTCDate, getNextTuesdayISOString} from './dates';
import {getEventObservableArray} from './upcoming-events';

type InputProperty = Extract<keyof ViewModel,
    'title' | 'date' | 'cost' | 'intro' |
    'dj' | 'musicType' |
    'teacherBeginner' | 'topicBeginner' |
    'teacherIntermediate' | 'topicIntermediate' |
    'photoCredit' | 'facebookEventUrl'
>;

class ViewModel {
    public title = ko.observable('');
    public date = observableDateString('');
    public cost = ko.observable('');
    public intro = ko.observable('');
    public dj = ko.observable('');
    public musicType = ko.observable('');
    public teacherBeginner = ko.observable('');
    public topicBeginner = ko.observable('');
    public teacherIntermediate = ko.observable('');
    public topicIntermediate = ko.observable('');
    public upcomingEvents = getEventObservableArray(this.date);
    public photoCredit = ko.observable('');
    public facebookEventUrl = ko.observable('');

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

    public etango = ko.pureComputed(() => {
        return etango(this.templateLocals());
    });
    public eugeneTango = ko.pureComputed(() => {
        return eugeneTango(this.templateLocals());
    });
    public facebook = ko.pureComputed(() => {
        return facebook(this.templateLocals());
    });

    private templateLocals = ko.pureComputed(() => ({
        title: this.title().trim(),
        date: formatUTCDate(new Date(this.date())),
        cost: this.cost().trim(),
        intro: this.intro().trim(),
        dj: this.dj().trim(),
        musicType: this.musicType(),
        teacherBeginner: this.teacherBeginner().trim(),
        topicBeginner: this.topicBeginner(),
        teacherIntermediate: this.teacherIntermediate().trim(),
        topicIntermediate: this.topicIntermediate().trim(),
        upcomingEvents: this.upcomingEvents().map((event) => ({
            date: formatUTCDate(new Date(event.date())),
            title: event.title().trim()
        })),
        photoCredit: this.photoCredit().trim(),
        facebookEventUrl: this.facebookEventUrl().trim()
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
            title: 'Tuesday Bailonga',
            date: getNextTuesdayISOString(new Date()),
            cost: '$7 – $10',
            topicIntermediate: 'TBD'
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
