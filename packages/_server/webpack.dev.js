/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./webpack.config');

module.exports = {
  ...config,
  devtool: 'source-map',
};
