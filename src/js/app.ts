import * as ko from 'knockout';

import '../css/styles.scss';
import facebook from '../templates/facebook.ejs.txt';

type ObservablePropertyNames<T> = {
    [K in keyof T]: T[K] extends ko.Observable ? K : never
}[keyof T];

type InputProperty = ObservablePropertyNames<ViewModel>;
type InputValueMap = Record<InputProperty, string>;

class ViewModel {
    public title = ko.observable('');
    public intro = ko.observable('');
    public dj = ko.observable('');
    public teacherBeginner = ko.observable('');
    public teacherIntermediate = ko.observable('');
    public topicIntermediate = ko.observable('');
    public cost = ko.observable('');

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
        Object.entries(this.getDefaultValues())
            .forEach(([key, val]) => this[key as InputProperty](val));
    }

    private getDefaultValues() {
        return {
            topicIntermediate: 'TBD',
            cost: '$7 – $10'
        } as Pick<InputValueMap, 'topicIntermediate' | 'cost'>;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
} else {
    ko.applyBindings(new ViewModel());
}
