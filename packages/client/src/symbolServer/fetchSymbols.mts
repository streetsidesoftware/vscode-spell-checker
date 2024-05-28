import type { DocumentSymbol, Location, LocationLink, Position, SymbolInformation, Uri } from 'vscode';
import { commands } from 'vscode';

export async function fetchDocumentSymbols(uri: Uri | undefined): Promise<(SymbolInformation | DocumentSymbol)[] | undefined> {
    try {
        const result = await commands.executeCommand<(SymbolInformation | DocumentSymbol)[] | null>(
            'vscode.executeDocumentSymbolProvider',
            uri,
        );
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchWorkspaceSymbols(query: string): Promise<SymbolInformation[] | undefined> {
    try {
        const result = await commands.executeCommand<SymbolInformation[] | null>('vscode.executeWorkspaceSymbolProvider', `query=${query}`);
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchReferences(uri: Uri, pos: Position): Promise<(Location | LocationLink)[] | undefined> {
    try {
        const result = await commands.executeCommand<Location[] | null>('vscode.executeReferenceProvider', uri, pos);
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchDefinitions(uri: Uri, pos: Position): Promise<(Location | LocationLink)[] | undefined> {
    try {
        const result = await commands.executeCommand<Location[] | null>('vscode.executeDefinitionProvider', uri, pos);
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchTypeDefinitions(uri: Uri, pos: Position): Promise<(Location | LocationLink)[] | undefined> {
    try {
        const result = await commands.executeCommand<Location[] | null>('vscode.executeTypeDefinitionProvider', uri, pos);
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchDeclaration(uri: Uri, pos: Position): Promise<(Location | LocationLink)[] | undefined> {
    try {
        const result = await commands.executeCommand<Location[] | null>('vscode.executeDeclarationProvider', uri, pos);
        return result || undefined;
    } catch {
        return undefined;
    }
}

export async function fetchImplementation(uri: Uri, pos: Position): Promise<(Location | LocationLink)[] | undefined> {
    try {
        const result = await commands.executeCommand<Location[] | null>('vscode.executeImplementationProvider', uri, pos);
        return result || undefined;
    } catch {
        return undefined;
    }
}
