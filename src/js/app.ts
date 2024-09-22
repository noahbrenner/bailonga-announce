import * as ko from "knockout";

import bailonga from "../templates/bailonga.html.ejs";
import etango from "../templates/etango.html.ejs";
import eugeneTango from "../templates/eugenetango.html.ejs";
import facebook from "../templates/facebook.txt.ejs";
import mailchimp1 from "../templates/mailchimp-1.html.ejs";
import mailchimp2 from "../templates/mailchimp-2.html.ejs";
import mailchimp3 from "../templates/mailchimp-3.html.ejs";
import {
    type IScheduleItem,
    type IState,
    type IUpcomingEvent,
    type Venue,
    VENUE_OPTIONS,
    VENU_DESCRIPTION,
} from "../types/state";
import { observableDateString } from "./date-observable";
import { getScheduleObservableArray } from "./schedule-items";
import { getEventObservableArray } from "./upcoming-events";
import { copyElementContentsToClipboard } from "./utils/clipboard";
import {
    formatUTCDate,
    getNextEventISOString,
    getTodayISOString,
    isValidISODate,
    nthWeekdayOfMonth,
    WEEKDAY,
} from "./utils/dates";
import {
    getArrayMember,
    getISODate,
    getString,
    getTimeString,
    isObject,
    isTimeString,
} from "./utils/validation";

/**
 * Return a string of first name(s) extracted from a string of full name(s)
 *
 * @param fullNameStr - One or more full names separated by `&`
 * @return One or more first names separated by `&`
 */
function getFirstName(fullNameStr: string) {
    const fullNames = fullNameStr.split(/\s*[&]\s*/);
    const firstNames = fullNames.map((name) => name.split(/\s+/)[0]);
    return firstNames.join(" & ");
}

function getTwelveHourTime(time: string) {
    if (time === "") {
        return "";
    }

    const [rawHour, minute] = time.split(":");
    const hour = Number(rawHour) % 12 || 12;
    return `${hour}:${minute}`;
}

interface ITemplateScheduleItem extends Omit<IScheduleItem, "start" | "end"> {
    time: string;
}

interface ITemplateLocals extends Omit<IState, "venue" | "scheduleItems"> {
    venue: string;
    venueAccessibility: string;
    scheduleItems: ITemplateScheduleItem[];
    weekday: string;
}

class ViewModel {
    private static LOCAL_STORAGE_KEY = "bailonga-announce";

    public title = ko.observable("");
    public date = observableDateString("");
    public cost = ko.observable("");
    public venue = ko.observable<Venue>("Ballroom");
    public scheduleItems = getScheduleObservableArray();
    public intro = ko.observable("");
    public dj = ko.observable("");
    public musicType = ko.observable("");
    public teacherBeginner = ko.observable("");
    public topicBeginner = ko.observable("");
    public teacherIntermediate = ko.observable("");
    public topicIntermediate = ko.observable("");
    public upcomingEvents = getEventObservableArray(this.date);
    public photoCredit = ko.observable("");
    public photoCreditMailchimp = ko.observable("");
    public facebookEventUrl = ko.observable("");
    public facebookEventUrlRequiredPrefix = "https://www.facebook.com/events/";
    public isFacebookEventUrlValid = ko.pureComputed(() => {
        const url = this.facebookEventUrl().trim();
        const requiredPrefix = this.facebookEventUrlRequiredPrefix;
        const minLength = Math.min(url.length, requiredPrefix.length);
        return url.slice(0, minLength) === requiredPrefix.slice(0, minLength);
    });

    public venueOptions: readonly Venue[] = VENUE_OPTIONS;

    public OTHER_MUSIC_TYPE = "Other (enter manually)" as const;
    public musicTypeOptions: readonly string[] = [
        "50/50 Alternative and Traditional",
        "100% Traditional",
        "100% Alternative",
        "First 3/4 traditional, last 1/4 alternative",
        "Tango/Blues-Fusion alternative mix",
        this.OTHER_MUSIC_TYPE,
    ];
    public customMusicType = ko.observable("");
    public showCustomMusicType = ko.pureComputed(
        () => this.musicType() === this.OTHER_MUSIC_TYPE
    );

    public topicBeginnerOptions: readonly string[] = [
        "Week 1: From zero, the very basics.",
        "Week 2: Musicality",
        "Week 3: Molinete",
        "Week 4: Cross System",
        "Week 5: Bonus Topic TBA",
    ];

    public showCopyAlert = ko.observable(false);
    public bailonga = this.pureComputedTemplate(bailonga);
    public etango = this.pureComputedTemplate(etango);
    public eugeneTango = this.pureComputedTemplate(eugeneTango);
    public facebook = this.pureComputedTemplate(facebook);
    public mailchimp1 = this.pureComputedTemplate(mailchimp1);
    public mailchimp2 = this.pureComputedTemplate(mailchimp2);
    public mailchimp3 = this.pureComputedTemplate(mailchimp3);

    public isPastEventDate = ko.computed(() => {
        return this.date() !== "" && this.date() < getTodayISOString();
    });

    private serializedState = ko.pureComputed((): IState => {
        const facebookEventUrl = this.facebookEventUrl().trim();
        const musicType = this.musicType();
        return {
            title: this.title().trim(),
            date: this.date(),
            cost: this.cost().trim(),
            venue: this.venue(),
            scheduleItems: this.scheduleItems().map((item) => ({
                start: item.start(),
                end: item.end(),
                description: item.description().trim(),
            })),
            intro: this.intro().trim(),
            dj: this.dj().trim(),
            musicType,
            customMusicType:
                musicType === this.OTHER_MUSIC_TYPE
                    ? this.customMusicType()
                    : "",
            teacherBeginner: this.teacherBeginner().trim(),
            topicBeginner: this.topicBeginner(),
            teacherIntermediate: this.teacherIntermediate().trim(),
            topicIntermediate: this.topicIntermediate().trim(),
            upcomingEvents: this.upcomingEvents().map((event) => ({
                date: event.date(),
                title: event.title().trim(),
            })),
            photoCredit: this.photoCredit().trim(),
            photoCreditMailchimp: this.photoCreditMailchimp().trim(),
            facebookEventUrl: facebookEventUrl.includes("?")
                ? facebookEventUrl.slice(0, facebookEventUrl.indexOf("?"))
                : facebookEventUrl,
        };
    });

    private templateLocals = ko.pureComputed((): ITemplateLocals => {
        const state = this.serializedState();
        const {
            date,
            venue,
            dj,
            scheduleItems,
            musicType,
            customMusicType,
            upcomingEvents,
            photoCredit,
            photoCreditMailchimp,
        } = state;

        const venueAccessibility =
            "The Vet’s club’s ramp is on the front-right corner of the building.";
        const upstairsAcessibility =
            "There is an elevator directly to the right once inside the main entrance.";

        return {
            ...state,
            date: formatUTCDate(new Date(date)),
            weekday: WEEKDAY,
            venue: VENU_DESCRIPTION[venue],
            venueAccessibility:
                venue === "Colonial Room"
                    ? venueAccessibility
                    : [venueAccessibility, upstairsAcessibility].join(" "),
            scheduleItems: scheduleItems.map(({ start, end, description }) => ({
                description: description.replace("{dj}", getFirstName(dj)),
                time:
                    [start, end]
                        .filter((time) => time !== "")
                        .map(getTwelveHourTime)
                        .join("–") + "PM", // We're assuming PM for now
            })),
            musicType:
                musicType === this.OTHER_MUSIC_TYPE
                    ? customMusicType
                    : musicType,
            upcomingEvents: upcomingEvents.map((event) => ({
                date: formatUTCDate(new Date(event.date)),
                title: event.title,
            })),
            photoCreditMailchimp:
                photoCredit === photoCreditMailchimp
                    ? photoCreditMailchimp
                    : [photoCredit, photoCreditMailchimp]
                          .filter((name) => name !== "")
                          .join(", "),
        };
    });

    constructor() {
        // Update week-based default values when the event date changes
        this.date.subscribe((newDateString) => {
            const eventDate = new Date(newDateString);
            const weekIndex = nthWeekdayOfMonth(eventDate) - 1;
            this.topicBeginner(this.topicBeginnerOptions[weekIndex]);
            this.venue(this.getDefaultVenue(eventDate));
        });

        // Reset custom music type when a preset music type is selected
        this.musicType.subscribe((newMusicType) => {
            if (newMusicType && newMusicType !== this.OTHER_MUSIC_TYPE) {
                this.customMusicType("");
            }
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

        // Create and enable copy-to-clipboard buttons for output text/html
        document.querySelectorAll(".show-copy-button").forEach((container) => {
            const copyTarget = container.querySelector<
                HTMLInputElement | HTMLTextAreaElement | HTMLDivElement
            >("input, textarea, div");
            if (!copyTarget) {
                return;
            }

            const button = document.createElement("button");
            button.innerText = "copy";
            container.prepend(button);

            button.addEventListener("click", () => {
                copyElementContentsToClipboard(copyTarget)
                    .then((didCopy) => didCopy && this.playCopyAnimation())
                    .catch(console.error);
            });
        });
    }

    public addScheduleItem() {
        this.scheduleItems.add();
    }

    public addUpcomingEvent() {
        this.upcomingEvents.add();
    }

    public resetForm() {
        if (window.confirm("Are you sure you want to reset the form?")) {
            this.setState(this.getDefaultValues());
        }
    }

    private getDefaultValues(): IState {
        const eventDate = getNextEventISOString(new Date());
        return {
            title: `${WEEKDAY} Bailonga`,
            date: eventDate,
            cost: "$7 – $10",
            venue: this.getDefaultVenue(new Date(eventDate)),
            scheduleItems: [
                {
                    start: "19:00",
                    end: "",
                    description: "Beginning and Intermediate lessons",
                },
                {
                    start: "19:45",
                    end: "22:00",
                    description: "DJ {dj}",
                },
            ],
            intro: "",
            dj: "",
            musicType: this.musicTypeOptions[0],
            customMusicType: "",
            teacherBeginner: "",
            topicBeginner: "",
            teacherIntermediate: "",
            topicIntermediate: "TBD",
            upcomingEvents: [],
            photoCredit: "",
            photoCreditMailchimp: "Dave Musgrove",
            facebookEventUrl: "",
        };
    }

    private setState(newState: IState) {
        (Object.keys(newState) as Array<keyof IState>).forEach((key) => {
            if (key === "scheduleItems") {
                this.scheduleItems([]);
                newState[key].forEach(({ start, end, description }) => {
                    this.scheduleItems.add(start, end, description);
                });
            } else if (key === "upcomingEvents") {
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
            console.error(
                "Error saving state to localStorage:",
                error instanceof Error ? error.message : error
            );
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

            const eventDate = getISODate(stored.date, fallback.date);

            return {
                title: getString(stored.title, fallback.title),
                date: eventDate,
                cost: getString(stored.cost, fallback.cost),
                venue: getArrayMember(
                    this.venueOptions,
                    stored.venue,
                    this.getDefaultVenue(new Date(eventDate))
                ),
                scheduleItems:
                    Array.isArray(stored.scheduleItems) &&
                    stored.scheduleItems.every(
                        (
                            item
                        ): item is {
                            start: string;
                            end: unknown;
                            description: string;
                        } =>
                            isObject(item) &&
                            isTimeString(item.start) &&
                            typeof item.description === "string"
                    )
                        ? stored.scheduleItems.map((item) => ({
                              start: getTimeString(item.start, ""),
                              end: getTimeString(item.end, ""),
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
                customMusicType: getString(
                    stored.customMusicType,
                    fallback.customMusicType
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
                    ? stored.upcomingEvents.filter(
                          (event): event is IUpcomingEvent =>
                              isObject(event) &&
                              typeof event.date === "string" &&
                              isValidISODate(event.date) &&
                              typeof event.title === "string"
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
            console.error(error instanceof Error ? error.message : error);
            return fallback;
        }
    }

    private getDefaultVenue(eventDate: Date): Venue {
        return nthWeekdayOfMonth(eventDate) === 2
            ? "Colonial Room"
            : "Ballroom";
    }

    private pureComputedTemplate(templateFunction: (data: object) => string) {
        return ko.pureComputed(() => {
            return templateFunction(this.templateLocals()).trim();
        });
    }

    private playCopyAnimation = (() => {
        let timeout: number;
        return () => {
            console.log("Playing animation");
            window.clearTimeout(timeout);

            // Stop and restart animation
            this.showCopyAlert(false);
            window.setTimeout(() => {
                this.showCopyAlert(true);
            }, 100);

            // Fully hide (display: none) after animation completes
            timeout = window.setTimeout(() => {
                this.showCopyAlert(false);
            }, 3100);
        };
    })();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        ko.applyBindings(new ViewModel());
    });
} else {
    ko.applyBindings(new ViewModel());
}
