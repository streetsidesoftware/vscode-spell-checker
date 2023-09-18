import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/out/', '/build/'],
    moduleNameMapper: {
        '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
    verbose: true,
};

export default config;
