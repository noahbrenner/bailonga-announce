import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as TerserWebpackPlugin from 'terser-webpack-plugin';
import {Configuration} from 'webpack';

import {baseConfig, inputTests, merge} from './webpack.common';

/** Production-mode webpack configuration. */
export default merge(baseConfig, {
    mode: 'production',

    output: {
        filename: '[name].[contenthash:6].js'
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [MiniCssExtractPlugin.loader]
        }]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash:6].css'
        })
    ],

    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                parallel: true
            }),
            new OptimizeCssAssetsPlugin()
        ]
    }
} as Configuration);
