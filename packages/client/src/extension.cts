import type { ExtensionContext } from 'vscode';
import type { ExtensionApi } from './extensionApi.cjs';

export async function activate(context: ExtensionContext): Promise<ExtensionApi> {
    const extension = await import('./extension.mjs');
    return extension.activate(context);
}
