import { window } from 'vscode';

import {
    fetchDefinitions,
    fetchDocumentSymbols,
    fetchImplementation,
    fetchReferences,
    fetchTypeDefinitions,
    fetchWorkspaceSymbols,
} from './fetchSymbols.mjs';

export async function experimentWithSymbols(): Promise<void> {
    const doc = window.activeTextEditor?.document;
    const uri = doc?.uri;
    const position = window.activeTextEditor?.selection.active;
    const docSym = await fetchDocumentSymbols(uri);
    console.log('docSym %o', docSym);

    // if (uri) {
    //     const tokens = await fetchSemanticTokens(uri);
    //     console.log('semantic tokens %o', tokens);
    // }

    if (doc && position) {
        const range = doc.getWordRangeAtPosition(position);
        const word = doc.getText(range);
        const wsSym = word && (await fetchWorkspaceSymbols(word));
        console.log('workspaceSym %s %o', word, wsSym);
    }

    if (uri && position) {
        const methods = {
            fetchReferences: fetchReferences,
            fetchDefinitions: fetchDefinitions,
            fetchTypeDefinitions: fetchTypeDefinitions,
            fetchImplementation: fetchImplementation,
        };
        await Promise.all(
            Object.entries(methods).map(async ([name, method]) => {
                const refs = await method(uri, position);
                console.log(`${name} %o`, refs);
            }),
        );
    }
}
