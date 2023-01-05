import * as ko from 'knockout';

import '../css/styles.scss';
import bailonga from '../templates/bailonga.ejs.html';
import etango from '../templates/etango.ejs.html';
import eugeneTango from '../templates/eugenetango.ejs.html';
import facebook from '../templates/facebook.ejs.txt';
import mailchimp1 from '../templates/mailchimp-1.ejs.html';
import mailchimp2 from '../templates/mailchimp-2.ejs.html';
import mailchimp3 from '../templates/mailchimp-3.ejs.html';
import { IScheduleItem, IState, IUpcomingEvent } from '../types/state';
import {observableDateString} from './date-observable';
import {getScheduleObservableArray} from './schedule-items';
import {getEventObservableArray} from './upcoming-events';
import {
    formatUTCDate,
    getNextEventISOString,
    getTodayISOString,
    isValidISODate,
    WEEKDAY,
} from './utils/dates';
import {
    getArrayMember,
    getISODate,
    getString,
    getTimeString,
    isObject,
    isTimeString,
} from './utils/validation';

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
    weekday: string;
}

class ViewModel {
    private static LOCAL_STORAGE_KEY = 'bailonga-announce';

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

    public isPastEventDate = ko.computed(() => {
        return this.date() !== '' && this.date() < getTodayISOString();
    });

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
            weekday: WEEKDAY,
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
        this.setState(this.loadState());

        // Save the current state in localStorage any time there are changes to
        // the state and 1 second has passed with no further changes.
        let debounceTimeout: number | undefined;
        this.serializedState.subscribe((state) => {
            window.clearTimeout(debounceTimeout);
            debounceTimeout = window.setTimeout(
                () => this.storeState(state),
                1000
            );
        });
    }

    public addScheduleItem() {
        this.scheduleItems.add();
    }

    public addUpcomingEvent() {
        this.upcomingEvents.add();
    }

    public resetForm() {
        if (window.confirm('Are you sure you want to reset the form?')) {
            this.setState(this.getDefaultValues());
        }
    }

    private getDefaultValues(): IState {
        return {
            title: `${WEEKDAY} Bailonga`,
            date: getNextEventISOString(new Date()),
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

    /** Save state in localStorage */
    private storeState(state: IState) {
        try {
            const stateString = JSON.stringify(state);
            localStorage.setItem(ViewModel.LOCAL_STORAGE_KEY, stateString);
        } catch (error) {
            console.error('Error saving state to localStorage:', error.message);
        }
    }

    /** Retrieve and validate state from localStorage */
    private loadState(): IState {
        const fallback = this.getDefaultValues();
        try {
            const storageItem = localStorage.getItem(
                ViewModel.LOCAL_STORAGE_KEY
            );
            if (!storageItem) {
                return fallback;
            }

            const stored: unknown = JSON.parse(storageItem);
            if (!isObject(stored)) {
                return fallback;
            }

            return {
                title: getString(stored.title, fallback.title),
                date: getISODate(stored.date, fallback.date),
                cost: getString(stored.cost, fallback.cost),
                scheduleItems:
                    Array.isArray(stored.scheduleItems) &&
                    stored.scheduleItems.every(
                        (item): item is {
                            start: string;
                            end: unknown;
                            description: string
                        } =>
                            isObject(item) &&
                            isTimeString(item.start) &&
                            typeof item.description === 'string'
                    )
                        ? stored.scheduleItems.map((item) => ({
                                start: getTimeString(item.start, ''),
                                end: getTimeString(item.end, ''),
                                description: item.description,
                            }))
                        : fallback.scheduleItems,
                intro: getString(stored.intro, fallback.intro),
                dj: getString(stored.dj, fallback.dj),
                musicType: getArrayMember(
                    this.musicTypeOptions,
                    stored.musicType,
                    fallback.musicType
                ),
                teacherBeginner: getString(
                    stored.teacherBeginner,
                    fallback.teacherBeginner
                ),
                topicBeginner: getArrayMember(
                    this.topicBeginnerOptions,
                    stored.topicBeginner,
                    fallback.topicBeginner
                ),
                teacherIntermediate: getString(
                    stored.teacherIntermediate,
                    fallback.teacherIntermediate
                ),
                topicIntermediate: getString(
                    stored.topicIntermediate,
                    fallback.topicIntermediate
                ),
                upcomingEvents: Array.isArray(stored.upcomingEvents)
                    ? stored.upcomingEvents
                        .filter(
                            (event): event is IUpcomingEvent =>
                                isObject(event) &&
                                typeof event.date === 'string' &&
                                isValidISODate(event.date) &&
                                typeof event.title === 'string'
                        )
                    : fallback.upcomingEvents,
                photoCredit: getString(
                    stored.photoCredit,
                    fallback.photoCredit
                ),
                photoCreditMailchimp: getString(
                    stored.photoCreditMailchimp,
                    fallback.photoCreditMailchimp
                ),
                facebookEventUrl: getString(
                    stored.facebookEventUrl,
                    fallback.facebookEventUrl
                ),
            };
        } catch (error) {
            console.error(error.message);
            return fallback;
        }
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
