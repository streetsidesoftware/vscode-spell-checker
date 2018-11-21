const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist = 'dist';

const viewerConfig = {
    devtool: 'source-map',
    mode: 'production',
    entry: {
        index: path.join(__dirname, 'src', 'index.tsx'),
    },
    output: {
        path: path.join(__dirname, dist),
        filename: '[name].bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                include: path.join(__dirname, 'src'),
            },
            {
                test: /\.hbs$/,
                use: 'handlebars-loader',
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'typings-for-css-modules-loader?modules&namedExport&camelCase'],
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, dist),
        compress: true,
        port: 3000,
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'index.hbs'),
            inject: 'body',
        }),
    ],
};

const testConfig = {
    devtool: 'source-map',
    mode: 'production',
    entry: {
        test: path.join(__dirname, 'src', 'test.tsx'),
    },
    output: {
        path: path.join(__dirname, dist),
        filename: '[name].bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                include: path.join(__dirname, 'src'),
            },
            {
                test: /\.hbs$/,
                use: 'handlebars-loader',
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, dist),
        compress: true,
        port: 3000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Tester CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'test.hbs'),
            inject: 'body',
            filename: 'test.html',
        }),
    ],
};

module.exports = [viewerConfig, testConfig];
