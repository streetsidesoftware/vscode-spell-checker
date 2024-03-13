import type { Disposable } from 'vscode';
import vscode from 'vscode';

export function activate(): Disposable {
    return vscode.commands.registerCommand('cSpell.createCSpellTerminal', createTerminal);
}

export async function createTerminal() {
    const { createTerminal } = await import('./repl.mjs');
    return createTerminal();
}
