import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as merge from 'webpack-merge';

import {baseConfig, inputTests} from './webpack.common';

/** Development-mode webpack configuration. */
export default merge.smart(baseConfig, {
    mode: 'development',

    output: {
        filename: '[name].js'
    },

    module: {
        rules: [{
            test: inputTests.css,
            loaders: [{
                loader: MiniCssExtractPlugin.loader as string,
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
});
