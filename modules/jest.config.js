const rootConfig = require('../jest.config.js');

/** @type {import('jest').Config} */
const config = {
    ...rootConfig,
    roots: ['.'],
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};

module.exports = config;
