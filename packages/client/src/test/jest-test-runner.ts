/**
 * Wires in Jest as the test runner in place of the default Mocha.
 * This is a modification of [Unibeautify/vscode](https://github.com/Unibeautify/vscode/blob/ec013cdf3e1c/test)
 */
const jest = require('@jest/core');
const runCLI = jest.runCLI;
// import {runCLI} from '@jest/core';
import { AggregatedResult } from '@jest/test-result';
import * as path from 'path';
import * as sourceMapSupport from 'source-map-support';

const rootDir = path.resolve(__dirname, '../../');
const fromRoot = (...subPaths: string[]): string => path.resolve(rootDir, ...subPaths);

const jestConfig = {
    rootDir: rootDir,
    roots: [ '<rootDir>/src/test' ],
    verbose: true,
    colors: true,
    collectCoverage: false,
    transform: JSON.stringify({ '^.+\\.ts$': 'ts-jest' }),
    runInBand: true, // Required due to the way the "vscode" module is injected.
    testRegex: '\\.(test|spec)\\.ts$',
    testEnvironment: fromRoot('out/test/jest-vscode-environment.js'),
    setupTestFrameworkScriptFile: fromRoot('out/test/jest-vscode-framework-setup.js'),
    moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
    testPathIgnorePatterns: [ "/node_modules/", ],
    globals: JSON.stringify({
        'ts-jest': {
            tsConfig: fromRoot('tsconfig.json')
        }
    })
};

console.error(JSON.stringify(jestConfig, null, 2));

export async function run(_testRoot: string, callback: TestRunnerCallback) {
    // Enable source map support. This is done in the original Mocha test runner,
    // so do it here. It is not clear if this is having any effect.
    sourceMapSupport.install();

    // Forward logging from Jest to the Debug Console.
    forwardStdoutStderrStreams();

    try {
        const { results } = await runCLI(jestConfig as any, [rootDir]);

        const failures = collectTestFailureMessages(results);

        if (failures.length > 0) {
            callback(null, failures);
            return;
        }

        callback(null);
    } catch (e) {
        callback(e);
    }
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Collect failure messages from Jest test results.
 *
 * @param results Jest test results.
 */
function collectTestFailureMessages(results: AggregatedResult): string[] {
    const failures = results.testResults.reduce<string[]>((acc, testResult) => {
        if (testResult.failureMessage) acc.push(testResult.failureMessage);
        return acc;
    }, []);

    return failures;
}

/**
 * Forward writes to process.stdout and process.stderr to console.log.
 *
 * For some reason this seems to be required for the Jest output to be streamed
 * to the Debug Console.
 */
function forwardStdoutStderrStreams() {
    const logger = (line: string) => {
      console.log(line); // tslint:disable-line:no-console
      return true;
    };

    process.stdout.write = logger;
    process.stderr.write = logger;
}

export type TestRunnerCallback = (error: Error | null, failures?: any) => void;