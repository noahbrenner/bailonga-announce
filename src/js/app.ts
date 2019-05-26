import * as ko from 'knockout';

import '../css/styles.scss';
import facebook from '../templates/facebook.ejs.txt';

class ViewModel {
    public title: ko.Observable<string>;
    public intro: ko.Observable<string>;
    public dj: ko.Observable<string>;
    public teacherBeginner: ko.Observable<string>;
    public teacherIntermediate: ko.Observable<string>;
    public topicIntermediate: ko.Observable<string>;
    public cost: ko.Observable<string>;

    public facebook = ko.pureComputed(() => facebook(this.templateLocals()));

    private templateLocals = ko.pureComputed(() => ({
        title: this.title().trim(),
        intro: this.intro().trim(),
        dj: this.dj().trim(),
        teacherBeginner: this.teacherBeginner().trim(),
        teacherIntermediate: this.teacherIntermediate().trim(),
        topicIntermediate: this.topicIntermediate().trim(),
        cost: this.cost().trim()
    }));

    constructor() {
        this.title = ko.observable('');
        this.intro = ko.observable('');
        this.dj = ko.observable('');
        this.teacherBeginner = ko.observable('');
        this.teacherIntermediate = ko.observable('');
        this.topicIntermediate = ko.observable('TBD');
        this.cost = ko.observable('$7 – $10');
    }
}

if (document.readyState === 'loading') {
    ko.applyBindings(new ViewModel());
} else {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
}
