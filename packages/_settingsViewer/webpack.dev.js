const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseConfig = require('./webpack.base');

const baseDevConfig = {
    ...baseConfig,
    devtool: 'source-map',
    mode: 'development',
    devServer: {
        contentBase: baseConfig.output.path,
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
        index: path.join(__dirname, 'src', 'viewer', 'viewer.tsx'),
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'viewer', 'index.hbs'),
            inject: 'body',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};

const testConfig = {
    ...baseDevConfig,
    entry: {
        test: path.join(__dirname, 'src', 'viewer', 'vsCodeTestWrapper.tsx'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Tester CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'viewer', 'index.hbs'),
            inject: 'body',
            filename: 'test.html',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};

module.exports = [viewerConfig, testConfig];
