const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const dist = 'dist';

const baseConfig = {
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
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader' },
                    // { loader: 'resolve-url-loader', options: {} },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            includePaths: ['node_modules'],
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|ttf|otf|eot|svg)$/,
                exclude: /node_modules/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },{
                test: /\.(pdf|jpg|png|gif|svg|ico)$/,
                use: [
                    {
                        loader: 'url-loader'
                    },
                ]
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, dist),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
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
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};

const viewerConfig = {
    ...baseConfig,
    entry: {
        index: path.join(__dirname, 'src', 'index.tsx'),
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'index.hbs'),
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
    ...baseConfig,
    entry: {
        test: path.join(__dirname, 'src', 'vsCodeTestWrapper.tsx'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Tester CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'index.hbs'),
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
