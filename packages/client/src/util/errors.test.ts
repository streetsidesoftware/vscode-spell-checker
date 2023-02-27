import { window } from 'vscode';

import { catchErrors, ErrorHandlers, handleErrors, isError, logErrors, Resolvers } from './errors';

const debug = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
const showErrorMessage = jest.spyOn(window, 'showErrorMessage').mockImplementation(() => Promise.resolve(undefined));

describe('Validate errors', () => {
    beforeEach(() => {
        log.mockClear();
        error.mockClear();
        debug.mockClear();
        showErrorMessage.mockClear();
    });

    test.each`
        value                                 | expected
        ${undefined}                          | ${false}
        ${5}                                  | ${false}
        ${{}}                                 | ${false}
        ${'error'}                            | ${false}
        ${{ message: 'hello' }}               | ${false}
        ${{ message: 'error', name: 'name' }} | ${true}
    `('isError $value', ({ value, expected }) => {
        expect(isError(value)).toBe(expected);
    });

    test.each`
        message    | doThrow  | expected
        ${'error'} | ${false} | ${'error'}
        ${'error'} | ${true}  | ${undefined}
    `('silenceErrors $message $doThrow', async ({ message, doThrow, expected }) => {
        await expect(ErrorHandlers.silenceErrors(e(message, doThrow), 'silenceErrors')).resolves.toBe(expected);
        expect(error).toHaveBeenCalledTimes(0);
        expect(log).toHaveBeenCalledTimes(0);
        expect(debug).toHaveBeenCalledTimes(0);
    });

    test.each`
        message    | doThrow  | expected
        ${'error'} | ${false} | ${'error'}
        ${'error'} | ${true}  | ${undefined}
    `('logErrors $message $doThrow', async ({ message, doThrow, expected }) => {
        await expect(logErrors(e(message, doThrow), 'logErrors')).resolves.toBe(expected);
        expect(log).toHaveBeenCalledTimes(expected ? 0 : 1);
        expect(error).toHaveBeenCalledTimes(0);
        expect(debug).toHaveBeenCalledTimes(0);
    });

    test.each`
        message    | doThrow  | expected
        ${'error'} | ${false} | ${'error'}
        ${'error'} | ${true}  | ${undefined}
    `('handleErrors $message $doThrow', async ({ message, doThrow, expected }) => {
        await expect(handleErrors(e(message, doThrow), 'handleErrors')).resolves.toBe(expected);
        expect(showErrorMessage).toHaveBeenCalledTimes(expected ? 0 : 1);
        expect(error).toHaveBeenCalledTimes(expected ? 0 : 1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(debug).toHaveBeenCalledTimes(0);
    });

    test.each`
        message    | doThrow  | expected
        ${'error'} | ${false} | ${'error'}
        ${'error'} | ${true}  | ${undefined}
    `('catchErrors $message $doThrow', async ({ message, doThrow, expected }) => {
        await expect(catchErrors(e, 'catchErrors')(message, doThrow)).resolves.toBe(expected);
        expect(error).toHaveBeenCalledTimes(expected ? 0 : 1);
        expect(log).toHaveBeenCalledTimes(0);
        expect(debug).toHaveBeenCalledTimes(0);
    });

    test.each`
        message       | doThrow  | resolver                 | expected     | errorCnt | logCnt
        ${'error'}    | ${false} | ${Resolvers.showError}   | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${Resolvers.showError}   | ${undefined} | ${1}     | ${0}
        ${'Canceled'} | ${true}  | ${Resolvers.showError}   | ${undefined} | ${0}     | ${0}
        ${'error'}    | ${false} | ${Resolvers.logError}    | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${Resolvers.logError}    | ${undefined} | ${0}     | ${1}
        ${'Canceled'} | ${true}  | ${Resolvers.logError}    | ${undefined} | ${0}     | ${0}
        ${'error'}    | ${false} | ${Resolvers.ignoreError} | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${Resolvers.ignoreError} | ${undefined} | ${0}     | ${0}
        ${'Canceled'} | ${true}  | ${Resolvers.ignoreError} | ${undefined} | ${0}     | ${0}
    `('Resolvers:  $message $doThrow $resolver', async ({ message, doThrow, resolver, expected, errorCnt, logCnt }) => {
        await expect(handleErrors(e(message, doThrow), 'handleErrors', resolver)).resolves.toBe(expected);
        expect(error).toHaveBeenCalledTimes(errorCnt);
        expect(log).toHaveBeenCalledTimes(logCnt);
        expect(debug).toHaveBeenCalledTimes(0);
    });

    test.each`
        message       | doThrow  | handler                        | expected     | errorCnt | logCnt
        ${'error'}    | ${false} | ${ErrorHandlers.showErrors}    | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${ErrorHandlers.showErrors}    | ${undefined} | ${1}     | ${0}
        ${'Canceled'} | ${true}  | ${ErrorHandlers.showErrors}    | ${undefined} | ${0}     | ${0}
        ${'error'}    | ${false} | ${ErrorHandlers.logErrors}     | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${ErrorHandlers.logErrors}     | ${undefined} | ${0}     | ${1}
        ${'Canceled'} | ${true}  | ${ErrorHandlers.logErrors}     | ${undefined} | ${0}     | ${0}
        ${'error'}    | ${false} | ${ErrorHandlers.silenceErrors} | ${'error'}   | ${0}     | ${0}
        ${'error'}    | ${true}  | ${ErrorHandlers.silenceErrors} | ${undefined} | ${0}     | ${0}
        ${'Canceled'} | ${true}  | ${ErrorHandlers.silenceErrors} | ${undefined} | ${0}     | ${0}
    `('Handlers:  $message $doThrow $handler', async ({ message, doThrow, handler, expected, errorCnt, logCnt }) => {
        await expect(handler(e(message, doThrow), 'handleErrors')).resolves.toBe(expected);
        expect(error).toHaveBeenCalledTimes(errorCnt);
        expect(log).toHaveBeenCalledTimes(logCnt);
        expect(debug).toHaveBeenCalledTimes(0);
    });
});

async function e(message: string, doThrow = true): Promise<string> {
    if (doThrow) {
        const error = new Error(message);
        error.name = message;
        throw error;
    }

    return message;
}
