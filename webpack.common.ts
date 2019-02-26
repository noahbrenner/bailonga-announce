import * as path from 'path';

import * as autoprefixer from 'autoprefixer';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';

/**
 * A map of each output file extension to a RegExp matching its source files.
 *
 * All `webpackConfig.module.rules.test` values are specified using this object.
 * The benefit: Changing an input filetype (e.g. CSS -> SCSS) only requires
 * modifications to *this* object and to the base webpack configuration.
 */
export const inputTests: Record<'css' | 'html' | 'js', RegExp> = {
    css: /\.scss$/,
    html: /\.pug/,
    js: /\.ts$/
};

/* === Loaders with specified options === */

const postcssLoader: webpack.RuleSetLoader = {
    loader: 'postcss-loader',
    options: {
        plugins: [
            autoprefixer()
        ]
    }
};

/**
 * This project's base webpack configuration.
 *
 * Configurations inheriting from this one should, at minimum, define:
 * - mode
 * - output.filename
 */
export const baseConfig: webpack.Configuration = {
    entry: {
        app: './src/app.ts'
    },

    output: {
        path: path.resolve(__dirname, 'dist')
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [
                'css-loader',
                postcssLoader,
                'sass-loader'
            ]
        }, {
            test: inputTests.html,
            loaders: [
                'pug-loader'
            ]
        }, {
            test: inputTests.js,
            loaders: [
                'ts-loader'
            ]
        }, {
            test: /\.ejs\.(html|txt)/,
            loaders: [
                path.resolve('./lib/ejs-loader.ts')
            ]
        }]
    },

    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.pug'
        })
    ],

    devServer: {
        // This is a hack to enable automatic reloading of HTML
        // See: https://github.com/webpack/webpack-dev-server/issues/1271
        contentBase: path.resolve(__dirname, 'src'),
        watchContentBase: true
    }
};
