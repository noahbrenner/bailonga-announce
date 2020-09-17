import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {Configuration} from 'webpack';

import {baseConfig, inputTests, merge} from './webpack.common';

/** Development-mode webpack configuration. */
export default merge(baseConfig, {
    mode: 'development',

    output: {
        filename: '[name].js'
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [{
                loader: MiniCssExtractPlugin.loader,
                options: {
                    hmr: true
                }
            }]
        }]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ],

    devServer: {
        port: 8080
    }
} as Configuration);
