import type { Uri } from 'vscode';
import { env } from 'vscode';

export async function openExternalUrl(url: string | URL): Promise<boolean> {
    // Hack to work around bug in VSCode see: https://github.com/microsoft/vscode/issues/85930
    return env.openExternal(url.toString() as unknown as Uri);
}
