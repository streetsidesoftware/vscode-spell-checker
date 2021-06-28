import { commands, TextDocument } from 'vscode';
import { CSpellClient } from './client';
import { extensionId } from './constants';

const prefix = extensionId;

interface DocumentContext {
    usesConfigFile: boolean;
    usesCustomDictionary: boolean;
}

export interface ContextTypes {
    documentConfigContext: DocumentContext;
}

/**
 * Set context values
 * @param name - name of context to set
 * @param value - object containing key / values pairs to set
 * @returns resolves on success.
 */
export async function setContext<key extends keyof ContextTypes>(name: key, value: ContextTypes[key]): Promise<void> {
    if (typeof value === 'object') {
        const p = Object.entries(value).map(([k, v]) => commands.executeCommand('setContext', `${prefix}.${name}.${k}`, v));
        await Promise.all(p);
        return;
    }
    await commands.executeCommand('setContext', `${prefix}.${name}`, value);
}

/**
 * Update any menu related context values because the active document changed.
 * @param client - used to fetch the configuration.
 * @param doc - the new active document or undefined
 * @returns resolves on success.
 */
export async function updateDocumentRelatedContext(client: CSpellClient, doc: TextDocument | undefined): Promise<void> {
    if (!doc) {
        await setContext('documentConfigContext', {
            usesConfigFile: false,
            usesCustomDictionary: false,
        });
        return;
    }

    const cfg = await client.getConfigurationForDocument(doc);
    await setContext('documentConfigContext', {
        usesConfigFile: cfg.configFiles.length > 0,
        usesCustomDictionary: true,
    });
    return;
}
