export const VENUE_OPTIONS = [
    "Ballroom",
    "Colonial Room",
    "Upstairs Studio to the Left",
] as const;

export type Venue = (typeof VENUE_OPTIONS)[number];

export interface IScheduleItem {
    start: string;
    end: string;
    description: string;
}

export interface IUpcomingEvent {
    date: string;
    title: string;
}

export interface IState {
    title: string;
    date: string;
    cost: string;
    venue: Venue;
    scheduleItems: IScheduleItem[];
    intro: string;
    dj: string;
    musicType: string;
    teacherBeginner: string;
    topicBeginner: string;
    teacherIntermediate: string;
    topicIntermediate: string;
    upcomingEvents: IUpcomingEvent[];
    photoCredit: string;
    photoCreditMailchimp: string;
    facebookEventUrl: string;
}
