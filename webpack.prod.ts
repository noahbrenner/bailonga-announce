import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as TerserWebpackPlugin from 'terser-webpack-plugin';
import * as merge from 'webpack-merge';

import {baseConfig} from './webpack.common';

/** Production-mode webpack configuration. */
export default merge.smart(baseConfig, {
    mode: 'production',

    output: {
        filename: '[name].[contenthash:6].js'
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
});
