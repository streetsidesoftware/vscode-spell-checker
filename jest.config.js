/** @type {import('jest').Config} */
const config = {
    roots: ['./src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    // verbose: true,
    testRegex: '(/__tests__/.*|\\.(test|spec|perf))\\.[jt]sx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageReporters: ['html', 'json', ['lcov', { projectRoot: __dirname }], 'text'],
    // "coverageProvider": "v8",
    collectCoverageFrom: ['src/**/*.ts', '!**/*.test.helper.ts', '!**/node_modules/**', '!**/vendor/**'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js',
    },
    maxConcurrency: 1,
};

module.exports = config;
