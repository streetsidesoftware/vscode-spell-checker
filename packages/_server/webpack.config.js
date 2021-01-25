/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: {
    server: './src/server.ts',
    api: './src/api.ts'
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
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
    /^@cspell\/cspell-bundled-dicts/,
  ],
  output: {
    path: path.resolve(__dirname, '../client/server'),
    filename: '[name].js',
  },
};
