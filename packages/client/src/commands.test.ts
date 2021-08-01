import { readTextDocument } from 'jest-mock-vscode';
import * as vscode from 'vscode';
import { __testing__ } from './commands';
import { extensionId } from './constants';
import { commandDisplayCSpellInfo } from './infoViewer';
import { mustBeDefined, readExtensionPackage } from './test/helpers';

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
        const implemented = new Set(Object.keys(commandHandlers));
        implemented.add(commandDisplayCSpellInfo); // Handled by infoView
        const found = commands.filter((cmd) => implemented.has(cmd));
        expect(found).toEqual(commands);
    });
});

function thisDoc() {
    return readTextDocument(vscode.Uri.file(__filename));
}
