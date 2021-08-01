import { isError, silenceErrors, logErrors, handleErrors, catchErrors } from './errors';
import { window } from 'vscode';

const debug = jest.spyOn(console, 'debug').mockImplementation(() => {});
const log = jest.spyOn(console, 'log').mockImplementation(() => {});
const error = jest.spyOn(console, 'error').mockImplementation(() => {});
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
        await expect(silenceErrors(e(message, doThrow), 'silenceErrors')).resolves.toBe(expected);
        expect(error).toHaveBeenCalledTimes(0);
        expect(log).toHaveBeenCalledTimes(expected ? 0 : 1);
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
});

async function e(message: string, doThrow = true): Promise<string> {
    if (doThrow) throw new Error(message);
    return message;
}
