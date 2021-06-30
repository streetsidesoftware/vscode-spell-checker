import * as vscodeUri from 'vscode-uri';

export class Uri extends vscodeUri.URI {
    static joinPath(uri: Uri, ...parts: string[]): Uri {
        return vscodeUri.Utils.joinPath(uri, ...parts);
    }
}
