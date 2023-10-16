import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/out/', '/build/'],
    moduleNameMapper: {
        '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
    verbose: true,
};

// cspell:ignore webm

export default config;
