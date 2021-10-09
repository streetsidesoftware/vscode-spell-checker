/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base');

const baseDevConfig = {
    ...baseConfig,
    devtool: 'source-map',
    mode: 'development',
    devServer: {
        static: baseConfig.output.path,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
        compress: true,
        port: 3000,
    },
};

const viewerConfig = {
    ...baseDevConfig,
    entry: {
        viewer: path.join(__dirname, 'src', 'viewer', 'viewer.tsx'),
        testWebView: path.join(__dirname, 'src', 'viewer', 'vsCodeTestWrapper.tsx'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'viewer', 'index.hbs'),
            inject: 'body',
            chunks: ['viewer'],
        }),
        new HtmlWebpackPlugin({
            title: 'Tester CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'viewer', 'index.hbs'),
            inject: 'body',
            filename: 'test.html',
            chunks: ['testWebView'],
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        fallback: { path: require.resolve('path-browserify') },
    },
};

module.exports = viewerConfig;
