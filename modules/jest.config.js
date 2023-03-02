const rootConfig = require('../jest.config.js');

/** @type {import('jest').Config} */
const config = {
    ...rootConfig,
    roots: ['.'],
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    transform: {
        // '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.base.json' }],
        '^.+/_server/.+\\.tsx?$': ['ts-jest', { tsconfig: '_server/tsconfig.json' }],
    },
};

module.exports = config;
