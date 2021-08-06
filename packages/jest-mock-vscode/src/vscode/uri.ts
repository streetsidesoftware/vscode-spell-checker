import type * as vscode from 'vscode';
import * as vscodeUri from 'vscode-uri';

export class Uri extends vscodeUri.URI {
    static joinPath(uri: Uri, ...parts: string[]): Uri {
        return vscodeUri.Utils.joinPath(uri, ...parts);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static isUri(uri: any): uri is Uri {
        return uri instanceof Uri || uri instanceof vscodeUri.URI;
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isUri(u: any): u is vscode.Uri {
    return Uri.isUri(u);
}
