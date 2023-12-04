import { createVSCodeMock } from 'jest-mock-vscode';
import { vi } from 'vitest';

const vscode = createVSCodeMock(vi);

module.exports = vscode;
