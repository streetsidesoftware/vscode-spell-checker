/**
 * To use.
 * In your repository add the file:
 * __mocks__/vscode.js
 * ```
 * module.exports = require('jest-mock-vscode');
 * ```
 */

export const OverviewRulerLane = {
    Left: null,
};

export const debug = {
    onDidTerminateDebugSession: jest.fn(),
    startDebugging: jest.fn(),
};

export const commands = {
    executeCommand: jest.fn(),
};

// cspell:word Evaluatable
