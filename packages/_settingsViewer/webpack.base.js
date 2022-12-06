/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist = path.join(__dirname, 'out', 'webapp');

const baseConfig = {
    mode: 'production',
    output: {
        path: dist,
        filename: '[name].bundle.js',
        publicPath: '/',
        assetModuleFilename: '[path][name].[ext]',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                include: path.join(__dirname, 'src'),
            },
            {
                test: /\.hbs$/,
                use: 'handlebars-loader',
            },
            {
                test: /\.(ttf|otf|eot|svg)$/,
                exclude: /node_modules/,
                type: 'asset/resource',
            },
            {
                test: /\.(woff2?)$/,
                exclude: /node_modules/,
                type: 'asset/inline',
            },
            {
                test: /\.(pdf|jpg|png|gif|svg|ico)$/,
                type: 'asset/inline',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: path.join('!!handlebars-loader!src', 'viewer', 'index.hbs'),
            inject: 'body',
        }),
    ],
};

module.exports = baseConfig;
