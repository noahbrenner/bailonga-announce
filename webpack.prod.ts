import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as merge from 'webpack-merge';

import {baseConfig, inputTests} from './webpack.common';

/** Custom webpack merging function. */
const smartMerge = merge.smartStrategy({
    // Prepend new loaders so that webpack executes them last
    'module.rules.loaders': 'prepend'
});

/** Production-mode webpack configuration. */
export default smartMerge(baseConfig, {
    mode: 'production',

    output: {
        filename: '[name].[contenthash:6].js'
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [
                MiniCssExtractPlugin.loader
            ]
        }]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash:6].css'
        })
    ]
});
