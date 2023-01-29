Bailonga Announce
=================

> A simple web app which generates the weekly announcements for [Bailonga](http://www.bailonga.org/), a tango dance event organized by Kella Hanna-Wayne in Eugene, OR.

Browser Support
---------------

Only recent browsers are supported. Since this website is built to be used mostly by one person, wider support isn't needed. If support for older browsers *is* ever needed, the likely places to make configuration changes are:

* `package.json`: `browserslist`
* `tsconfig.json`: `compilerOptions.target`
* Add any necessary polyfills, such as `Promise`
