import * as ko from "knockout";

class ScheduleItem {
  public start = ko.observable("");
  public end = ko.observable("");
  public description = ko.observable("");

  constructor(
    public parent: ScheduleObservableArray,
    start: string,
    end: string,
    description: string,
  ) {
    this.start.subscribe(() => this.parent.sortByStartTime());
    this.start(start); // e.g. '19:00'
    this.end(end); // e.g. '22:00'
    this.description(description);
  }

  public getSortingValue() {
    // `Number` also returns 0 for the empty string, which is what we want
    return Number(this.start().split(":").join(""));
  }

  public remove() {
    this.parent.remove(this);
  }
}

type ScheduleObservableArray = ReturnType<typeof getScheduleObservableArray>;

export function getScheduleObservableArray() {
  const baseObservable = ko.observableArray<ScheduleItem>([]);

  function add(
    this: ScheduleObservableArray,
    start = "",
    end = "",
    description = "",
  ) {
    if (start === "") {
      start = this.getDefaultStartTime();
    }

    this.push(new ScheduleItem(this, start, end, description));
  }

  function getDefaultStartTime(this: ScheduleObservableArray) {
    const items = this();
    const latestTime =
      items.length > 0
        ? items[items.length - 1].start() // Items are sorted by start time
        : "18:45"; // 15 till 7PM because we'll be adding 15 minutes

    let [hour, minute] = latestTime.split(":").map(Number);

    if (minute < 45) {
      minute += 15;
    } else {
      hour += 1;
      minute = 0;
    }

    return `${hour}:${String(minute).padStart(2, "0")}`;
  }

  function sortByStartTime(this: ScheduleObservableArray) {
    this.sort((left, right) => {
      return left.getSortingValue() - right.getSortingValue();
    });
  }

  const extensions = {
    add,
    getDefaultStartTime,
    sortByStartTime,
  };

  return Object.assign(baseObservable, extensions);
}
