import * as ko from 'knockout';

import '../css/styles.scss';
import bailonga from '../templates/bailonga.ejs.html';
import etango from '../templates/etango.ejs.html';
import eugeneTango from '../templates/eugenetango.ejs.html';
import facebook from '../templates/facebook.ejs.txt';
import mailchimp1 from '../templates/mailchimp-1.ejs.html';
import mailchimp2 from '../templates/mailchimp-2.ejs.html';
import mailchimp3 from '../templates/mailchimp-3.ejs.html';
import { IScheduleItem, IState } from '../types/state';
import {observableDateString} from './date-observable';
import {getScheduleObservableArray} from './schedule-items';
import {getEventObservableArray} from './upcoming-events';
import {formatUTCDate, getNextTuesdayISOString} from './utils/dates';

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

interface ITemplateScheduleItem extends Omit<IScheduleItem, 'start' | 'end'> {
    time: string;
}

interface ITemplateLocals extends Omit<IState, 'scheduleItems'> {
    scheduleItems: ITemplateScheduleItem[];
}

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

    private serializedState = ko.pureComputed((): IState => ({
        title: this.title().trim(),
        date: this.date(),
        cost: this.cost().trim(),
        scheduleItems: this.scheduleItems().map((item) => ({
            start: item.start(),
            end: item.end(),
            description: item.description().trim()
        })),
        intro: this.intro().trim(),
        dj: this.dj().trim(),
        musicType: this.musicType(),
        teacherBeginner: this.teacherBeginner().trim(),
        topicBeginner: this.topicBeginner(),
        teacherIntermediate: this.teacherIntermediate().trim(),
        topicIntermediate: this.topicIntermediate().trim(),
        upcomingEvents: this.upcomingEvents().map((event) => ({
            date: event.date(),
            title: event.title().trim()
        })),
        photoCredit: this.photoCredit().trim(),
        photoCreditMailchimp: this.photoCreditMailchimp().trim(),
        facebookEventUrl: this.facebookEventUrl().trim()
    }));

    private templateLocals = ko.pureComputed((): ITemplateLocals => {
        const state = this.serializedState();
        const {
            date,
            dj,
            scheduleItems,
            upcomingEvents,
            photoCredit,
            photoCreditMailchimp,
        } = state;

        return {
            ...state,
            date: formatUTCDate(new Date(date)),
            scheduleItems: scheduleItems.map(({ start, end, description }) => ({
                description: description.replace('{dj}', getFirstName(dj)),
                time: [start, end]
                    .filter((time) => time !== '')
                    .map(getTwelveHourTime)
                    .join('–') + 'PM', // We're assuming PM for now
            })),
            upcomingEvents: upcomingEvents.map((event) => ({
                date: formatUTCDate(new Date(event.date)),
                title: event.title,
            })),
            photoCreditMailchimp: photoCredit === photoCreditMailchimp
                ? photoCreditMailchimp
                : [photoCredit, photoCreditMailchimp]
                    .filter((name) => name !== '')
                    .join(', '),
        };
    });

    constructor() {
        // Update the default beginner topic whenever the event date changes
        this.date.subscribe((newDateString) => {
            const utcDate = new Date(newDateString);
            const weekIndex = Math.floor((utcDate.getUTCDate() - 1) / 7);
            this.topicBeginner(this.topicBeginnerOptions[weekIndex]);
        });

        // Initialize default values
        this.setState(this.getDefaultValues());
    }

    public addScheduleItem() {
        this.scheduleItems.add();
    }

    public addUpcomingEvent() {
        this.upcomingEvents.add();
    }

    private getDefaultValues(): IState {
        return {
            title: 'Tuesday Bailonga',
            date: getNextTuesdayISOString(new Date()),
            cost: '$7 – $10',
            scheduleItems: [
                {
                    start: '19:00',
                    end: '',
                    description: 'Beginning and Intermediate lessons'
                },
                {
                    start: '19:45',
                    end: '22:00',
                    description: 'DJ {dj}'
                },
            ],
            intro: '',
            dj: '',
            musicType: '',
            teacherBeginner: '',
            topicBeginner: '',
            teacherIntermediate: '',
            topicIntermediate: 'TBD',
            upcomingEvents: [],
            photoCredit: '',
            photoCreditMailchimp: 'Dave Musgrove',
            facebookEventUrl: '',
        };
    }

    private setState(newState: IState) {
        (Object.keys(newState) as Array<keyof IState>).forEach((key) => {
            if (key === 'scheduleItems') {
                this.scheduleItems([]);
                newState[key].forEach(({ start, end, description }) => {
                    this.scheduleItems.add(start, end, description);
                });
            } else if (key === 'upcomingEvents') {
                this.upcomingEvents([]);
                newState[key].forEach(({ date, title }) => {
                    this.upcomingEvents.add(date, title);
                });
            } else {
                this[key](newState[key]);
            }
        });
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
