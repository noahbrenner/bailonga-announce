import * as ko from 'knockout';

import '../css/styles.scss';
import facebook from '../templates/facebook.ejs.txt';
import {formatUTCDate, getNextTuesdayDateString} from './dates';

type ObservablePropertyNames<T> = {
    [K in keyof T]: T[K] extends ko.Observable ? K : never
}[keyof T];

type InputProperty = ObservablePropertyNames<ViewModel>;
type InputValueMap = Record<InputProperty, string>;

class ViewModel {
    public title = ko.observable('');
    public date = ko.observable('');
    public intro = ko.observable('');
    public dj = ko.observable('');
    public musicType = ko.observable('');
    public teacherBeginner = ko.observable('');
    public topicBeginner = ko.observable('');
    public teacherIntermediate = ko.observable('');
    public topicIntermediate = ko.observable('');
    public cost = ko.observable('');

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
        cost: this.cost().trim()
    }));

    constructor() {
        // Update the default beginner topic whenever the event date changes
        this.date.subscribe((newDateString) => {
            const selectedDate = new Date(newDateString);
            const weekIndex = Math.floor((selectedDate.getUTCDate() - 1) / 7);
            this.topicBeginner(this.topicBeginnerOptions[weekIndex]);
        });

        // Initialize default values
        Object.entries(this.getDefaultValues())
            .forEach(([key, val]) => this[key as InputProperty](val));
    }

    private getDefaultValues() {
        return {
            date: getNextTuesdayDateString(),
            topicIntermediate: 'TBD',
            cost: '$7 – $10'
        } as Pick<InputValueMap, 'date' | 'topicIntermediate' | 'cost'>;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
} else {
    ko.applyBindings(new ViewModel());
}
