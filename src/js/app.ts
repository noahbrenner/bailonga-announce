import * as ko from 'knockout';

import '../css/styles.scss';
import html from '../templates/bar.ejs.html';
import text from '../templates/foo.ejs.txt';

class ViewModel {
    public title: ko.Observable<string>;

    public text = ko.pureComputed(() => text(this.templateLocals()));
    public html = ko.pureComputed(() => html(this.templateLocals()));

    private templateLocals = ko.pureComputed(() => ({
        content: this.title().trim()
    }));

    constructor() {
        this.title = ko.observable('');
    }
}

if (document.readyState === 'loading') {
    ko.applyBindings(new ViewModel());
} else {
    document.addEventListener('DOMContentLoaded', () => {
        ko.applyBindings(new ViewModel());
    });
}
