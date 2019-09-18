import * as ko from 'knockout';

import '../css/styles.scss';
import bailonga from '../templates/bailonga.ejs.html';
import etango from '../templates/etango.ejs.html';
import eugeneTango from '../templates/eugenetango.ejs.html';
import facebook from '../templates/facebook.ejs.txt';
import mailchimp1 from '../templates/mailchimp-1.ejs.html';
import mailchimp2 from '../templates/mailchimp-2.ejs.html';
import mailchimp3 from '../templates/mailchimp-3.ejs.html';
import {observableDateString} from './date-observable';
import {formatUTCDate, getNextTuesdayISOString} from './dates';
import {getScheduleObservableArray} from './schedule-items';
import {getEventObservableArray} from './upcoming-events';

/**
 * Return a string of first name(s) extracted from a string of full name(s)
 *
 * @param fullNameStr - One or more full names separated by `&`
 * @return One or more first names separated by `&`
 */
function getFirstName(fullNameStr: string) {
    const fullNames = fullNameStr.split(/\s*[&]\s*/);
    const firstNames = fullNames.map((name) => name.split(/\s+/)[0]);
    return firstNames.join(' & ');
}

function getTwelveHourTime(time: string) {
    if (time === '') {
        return '';
    }

    const [rawHour, minute] = time.split(':');
    const hour = (Number(rawHour) % 12) || 12;
    return `${hour}:${minute}`;
}

type InputProperty = Extract<keyof ViewModel,
    'title' | 'date' | 'cost' | 'scheduleItems' | 'intro' |
    'dj' | 'musicType' |
    'teacherBeginner' | 'topicBeginner' |
    'teacherIntermediate' | 'topicIntermediate' |
    'photoCredit' | 'photoCreditMailchimp' | 'facebookEventUrl'
>;

class ViewModel {
    public title = ko.observable('');
    public date = observableDateString('');
    public cost = ko.observable('');
    public scheduleItems = getScheduleObservableArray();
    public intro = ko.observable('');
    public dj = ko.observable('');
    public musicType = ko.observable('');
    public teacherBeginner = ko.observable('');
    public topicBeginner = ko.observable('');
    public teacherIntermediate = ko.observable('');
    public topicIntermediate = ko.observable('');
    public upcomingEvents = getEventObservableArray(this.date);
    public photoCredit = ko.observable('');
    public photoCreditMailchimp = ko.observable('');
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

    public bailonga = this.pureComputedTemplate(bailonga);
    public etango = this.pureComputedTemplate(etango);
    public eugeneTango = this.pureComputedTemplate(eugeneTango);
    public facebook = this.pureComputedTemplate(facebook);
    public mailchimp1 = this.pureComputedTemplate(mailchimp1);
    public mailchimp2 = this.pureComputedTemplate(mailchimp2);
    public mailchimp3 = this.pureComputedTemplate(mailchimp3);

    private templateLocals = ko.pureComputed(() => ({
        title: this.title().trim(),
        date: formatUTCDate(new Date(this.date())),
        cost: this.cost().trim(),
        scheduleItems: this.scheduleItems().map((item) => ({
            time: [item.start(), item.end()]
                .filter((time) => time !== '')
                .map(getTwelveHourTime)
                .join('–') + 'PM', // We're assuming PM for now
            description: item.description().trim()
                .replace('{dj}', getFirstName(this.dj().trim()))
        })),
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
        photoCreditMailchimp: [...new Set([
            this.photoCreditMailchimp().trim(),
            this.photoCredit().trim()
        ])].filter((name) => name !== '').join(', '),
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
        Object.entries(this.getDefaultValues()).forEach(([key, val]) => {
            if (typeof val === 'string') {
                this[key as InputProperty](val);
            } else if (key === 'scheduleItems') {
                val.forEach(({start, end, description}) => {
                    this.scheduleItems.add(start, end, description);
                });
            }
        });
    }

    public addUpcomingEvent() {
        this.upcomingEvents.add();
    }

    private getDefaultValues() {
        interface IScheduleItem {
            start: string;
            end: string;
            description: string;
        }

        const scheduleItems: IScheduleItem[] = [{
            start: '19:00',
            end: '',
            description: 'Beginning and Intermediate lessons'
        }, {
            start: '19:45',
            end: '22:00',
            description: 'DJ {dj}'
        }];

        const result = {
            title: 'Tuesday Bailonga',
            date: getNextTuesdayISOString(new Date()),
            cost: '$7 – $10',
            scheduleItems,
            topicIntermediate: 'TBD',
            photoCreditMailchimp: 'Dave Musgrove'
        };

        return result as Pick<
            Record<InputProperty, string | IScheduleItem[]>,
            keyof typeof result
        > as typeof result;
    }

    private pureComputedTemplate(templateFunction: (data: object) => string) {
        return ko.pureComputed(() => {
            return templateFunction(this.templateLocals()).trim();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
} else {
    ko.applyBindings(new ViewModel());
}
