import * as merge from 'webpack-merge';

import {baseConfig, inputTests} from './webpack.common';

/** Custom webpack merging function. */
const smartMerge = merge.smartStrategy({
    // Prepend new loaders so that webpack executes them last
    'module.rules.loaders': 'prepend'
});

/** Development-mode webpack configuration. */
export default smartMerge(baseConfig, {
    mode: 'development',

    output: {
        filename: '[name].js'
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [
                'style-loader'
            ]
        }]
    },

    devServer: {
        port: 8080
    }
});
