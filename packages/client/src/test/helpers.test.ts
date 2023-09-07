import * as path from 'path';

import type { StackItem } from './helpers';
import { getCallStack, getPathToTemp, mustBeDefined, parseStackTrace } from './helpers';

describe('Validate Helpers', () => {
    test('getCallStack', () => {
        const stack = getCallStack();
        expect(stack[0]).toEqual(expect.objectContaining({ file: __filename }));
    });

    test('mustBeDefined', () => {
        expect(mustBeDefined('hello')).toBe('hello');
        expect(() => mustBeDefined(undefined)).toThrow('Value must be defined.');
    });

    test('getPathToTemp', () => {
        expect(getPathToTemp('my-file.txt').toString()).toMatch(path.basename(__filename));
        expect(getPathToTemp('my-file.txt', path.join(__dirname, 'some-file')).toString()).toMatch('some-file');
    });

    test.each(sampleStackTraceTests())('parseStackTrace %s', (stackTrace, expected) => {
        const r = parseStackTrace(stackTrace);
        expect(r).toEqual(expected);
    });
});

function sampleStackTraceTests(): [string, StackItem[]][] {
    return [
        [
            `    Error:
        at Object.getCallStack (/test/packages/client/src/test/helpers.ts:32:17)
        at Object.<anonymous> (/test/packages/client/src/test/helpers.test.ts:6:23)
        at Object.asyncJestTest (/test/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:106:37)
        at /test/node_modules/jest-jasmine2/build/queueRunner.js:45:12
        at new Promise (<anonymous>)
        at mapper (/test/node_modules/jest-jasmine2/build/queueRunner.js:28:19)
        at /test/node_modules/jest-jasmine2/build/queueRunner.js:75:41
        at processTicksAndRejections (internal/process/task_queues.js:93:5)
`,
            expectedStackItems(`
/test/packages/client/src/test/helpers.test.ts,6,23
/test/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js,106,37
/test/node_modules/jest-jasmine2/build/queueRunner.js,45,12
/test/node_modules/jest-jasmine2/build/queueRunner.js,28,19
/test/node_modules/jest-jasmine2/build/queueRunner.js,75,41
internal/process/task_queues.js,93,5
`),
        ],
        [
            `    Error:
        at Object.getCallStack (D:\\test\\packages\\client\\src\\test\\helpers.ts:32:17)
        at Object.<anonymous> (D:\\test\\packages\\client\\src\\test\\helpers.test.ts:6:23)
        at Object.asyncJestTest (D:\\test\\node_modules\\jest-jasmine2\\build\\jasmineAsyncInstall.js:106:37)
        at D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js:45:12
        at new Promise (<anonymous>)
        at mapper (D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js:28:19)
        at D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js:75:41
        at processTicksAndRejections (internal\\process\\task_queues.js:93:5)
`,
            expectedStackItems(`
D:\\test\\packages\\client\\src\\test\\helpers.test.ts,6,23
D:\\test\\node_modules\\jest-jasmine2\\build\\jasmineAsyncInstall.js,106,37
D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js,45,12
D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js,28,19
D:\\test\\node_modules\\jest-jasmine2\\build\\queueRunner.js,75,41
internal\\process\\task_queues.js,93,5
`),
        ],
    ];
}

function expectedStackItems(s: string): StackItem[] {
    return s
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => !!s)
        .map(splitStackItem);
}

function splitStackItem(s: string): StackItem {
    const parts = s.split(',');
    return {
        file: parts[0],
        line: Number.parseInt(parts[1]),
        column: Number.parseInt(parts[2]),
    };
}
