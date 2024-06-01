export const VENUE_OPTIONS = [
    "Ballroom",
    "Colonial Room",
    "Upstairs Studio",
] as const;

export type Venue = (typeof VENUE_OPTIONS)[number];

export const VENU_DESCRIPTION: Record<Venue, string> = {
    Ballroom: "Upstairs Ballroom at the Vet’s Club",
    "Colonial Room": "Colonial Room at the Vet’s Club",
    "Upstairs Studio": "Upstairs Studio to the Left at the Vet’s Club",
};

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
