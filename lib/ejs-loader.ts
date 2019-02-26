/*
 * There are many EJS loaders for webpack available on npm, but none of them
 * seem to be actively maintained. Since this app's EJS needs are fairly simple,
 * it wasn't a high bar to just create this custom loader. Also, since we're
 * using the `ejs` package directly, it's easier to keep it updated.
 */

import * as ejs from 'ejs';
import {loader} from 'webpack';

/** Output JavaScript source code for a compiled EJS template. */
const ejsLoader: loader.Loader = function (source) {
    const isDevMode = this._compilation.options.mode === 'development';

    if (typeof source !== 'string') {
        source = source.toString();
    }

    const templateFunction = ejs.compile(source, {
        client: true, // Generate a standalone function
        _with: false, // Do not use the `with` JavaScript keyword
        compileDebug: isDevMode // Only generate debug code in development
    });

    return `export default ${templateFunction.toString()}`;
};

export default ejsLoader;
