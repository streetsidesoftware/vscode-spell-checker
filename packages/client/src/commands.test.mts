import { readTextDocument } from 'jest-mock-vscode';
import { describe, expect, test, vi } from 'vitest';
import * as vscode from 'vscode';

import { __testing__ } from './commands.mjs';
import { extensionId } from './constants.js';
import { commandDisplayCSpellInfo } from './infoViewer/index.js';
import { mustBeDefined, readExtensionPackage } from './test/helpers.js';
import { registeredCommands as webviewCommands } from './webview/index.mjs';

vi.mock('vscode');
vi.mock('vscode-languageclient/node');

const { commandHandlers } = __testing__;

describe('Validate Commands', () => {
    test('thisDoc', async () => {
        const doc = await thisDoc();
        expect(doc.getText()).toEqual(expect.stringContaining('thisDoc'));
    });

    test('ensure commandHandlers cover commands', async () => {
        const pkg = await readExtensionPackage();
        const cmdPrefix = extensionId + '.';
        const commands = mustBeDefined(pkg.contributes?.commands)
            .map((cmd) => cmd.command)
            .filter((cmd) => cmd.startsWith(cmdPrefix));
        const implemented = new Set([
            ...Object.keys(commandHandlers),
            ...webviewCommands,
            commandDisplayCSpellInfo, // Handled by infoView
        ]);
        const found = commands.filter((cmd) => implemented.has(cmd));
        expect(found).toEqual(commands);
    });
});

function thisDoc() {
    return readTextDocument(vscode.Uri.parse(import.meta.url));
}
