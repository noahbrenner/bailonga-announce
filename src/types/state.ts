import { objectFromEntries } from "../js/utils/objects";

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

export const LOCAL_FACEBOOK_GROUPS = [
    "Eugene Tango",
    "Corvallis Tango",
] as const;
export const REMOTE_FACEBOOK_GROUPS = [
    "Alt Tango NW",
    "US West Coast Tango",
    "PDX Tango",
    "Portland Tango",
] as const;
export const NON_TANGO_FACEBOOK_GROUPS = [
    "Bailamos Eugene",
    "Dance Network Eugene",
    "Eugene Area Dance Club",
] as const;

export type FacebookGroupCheckboxState = Record<
    (
        | typeof LOCAL_FACEBOOK_GROUPS
        | typeof REMOTE_FACEBOOK_GROUPS
        | typeof NON_TANGO_FACEBOOK_GROUPS
    )[number],
    boolean
>;

export const ALL_FACEBOOK_GROUPS = [
    ...LOCAL_FACEBOOK_GROUPS,
    ...REMOTE_FACEBOOK_GROUPS,
    ...NON_TANGO_FACEBOOK_GROUPS,
] as const;

export const DEFAULT_FB_GROUP_CHECKBOX_STATE: Readonly<FacebookGroupCheckboxState> =
    objectFromEntries(
        ALL_FACEBOOK_GROUPS.map((groupName) => [groupName, false])
    );

export interface IState {
    title: string;
    date: string;
    cost: string;
    venue: Venue;
    scheduleItems: IScheduleItem[];
    intro: string;
    dj: string;
    musicType: string;
    customMusicType: string;
    teacherBeginner: string;
    topicBeginner: string;
    teacherIntermediate: string;
    topicIntermediate: string;
    upcomingEvents: IUpcomingEvent[];
    photoCredit: string;
    photoCreditMailchimp: string;
    facebookEventUrl: string;
    facebookGroupCheckboxState: FacebookGroupCheckboxState;
}
