const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base');

const tsConfig = require('./tsconfig.json');
const target = path.resolve(tsConfig['compilerOptions']['outDir']);
const dist = path.join(target, 'webapp');
const TerserPlugin = require('terser-webpack-plugin');

const viewerConfig = {
    ...baseConfig,
    entry: {
        index: path.join(__dirname, 'src/viewer/viewer.tsx'),
    },
    output: {
        path: dist,
        filename: '[name].bundle.js',
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSpell Settings Viewer',
            hash: true,
            template: 'src/viewer/index.html',
            inject: 'body',
        }),
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};

module.exports = viewerConfig;
