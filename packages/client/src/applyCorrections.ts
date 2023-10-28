import type { Location, Range, TextDocument, Uri } from 'vscode';
import { commands } from 'vscode';

async function findLocalReference(uri: Uri, range: Range): Promise<Location | undefined> {
    try {
        const locations = (await commands.executeCommand('vscode.executeReferenceProvider', uri, range.start)) as Location[];
        if (!Array.isArray(locations)) return undefined;
        return locations.find((loc) => loc.range.contains(range) && loc.uri.toString() === uri.toString());
    } catch (e) {
        return undefined;
    }
}
export async function findEditBounds(document: TextDocument, range: Range, useReference: boolean): Promise<Range | undefined> {
    if (useReference) {
        const refLocation = await findLocalReference(document.uri, range);
        return refLocation?.range;
    }

    const wordRange = document.getWordRangeAtPosition(range.start);
    if (!wordRange || !wordRange.contains(range)) {
        return undefined;
    }
    return wordRange;
}
