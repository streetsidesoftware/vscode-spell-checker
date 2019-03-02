const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseConfig = require('./webpack.base');

const tsConfig = require('./tsconfig.json');
const target = path.resolve(tsConfig['compilerOptions']['outDir']);
const dist = path.join(target, 'webapp');

const viewerConfig = {
    ...baseConfig,
    entry: {
        index: path.join(__dirname, 'src', 'viewer', 'viewer.tsx'),
    },
    output: {
        path: dist,
        filename: '[name].bundle.js',
        publicPath: '/',
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

module.exports = viewerConfig;
