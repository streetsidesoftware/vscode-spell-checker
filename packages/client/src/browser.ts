import { ExtensionContext } from 'vscode';
import { CSpellClient } from './client';
import * as di from './di';
import * as modules from './modules';
modules.init();

export async function activate(context: ExtensionContext): Promise<void> {
    console.log('CSpell running in browser 🎉');
    const client = await CSpellClient.create(context);
    context.subscriptions.push(client);

    di.set('client', client);
    di.set('extensionContext', context);
}
