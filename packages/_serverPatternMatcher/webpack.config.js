const path = require('path');

module.exports = {
    entry: {
        main: './src/main.ts',
        api: './src/api.ts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    node: {
        __filename: false,
        __dirname: false,
    },
    externalsType: 'commonjs-module',
    externalsPresets: {
        node: true,
    },
    externals: [
        /^regexp-worker/, // pulled out so the worker can be loaded correctly.
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
};
