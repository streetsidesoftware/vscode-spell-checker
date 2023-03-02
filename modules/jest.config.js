const rootConfig = require('../jest.config.js');

/** @type {import('jest').Config} */
const config = {
    ...rootConfig,
    roots: ['.'],
};

module.exports = config;
