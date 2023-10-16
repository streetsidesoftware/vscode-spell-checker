import { isErrorCodeException } from '@internal/common-utils';
import type { TextDocument, Uri } from 'vscode';
import { FileSystemError, Range, workspace, WorkspaceEdit } from 'vscode';

const fs = workspace.fs;

const FileNotFoundErrorCodes: Record<string, undefined | true> = {
    FileNotFound: true,
    EntryNotFound: true,
    ENOENT: true,
};

const fsCode = FileSystemError.FileNotFound().code;
FileNotFoundErrorCodes[fsCode] = true;

interface VSCodeFs {
    createDirectory(uri: Uri): Promise<void>;
    writeFile(uri: Uri, content: string, encoding?: 'utf8'): Promise<void>;
    readFile(uri: Uri, encoding: 'utf8'): Promise<string>;
    fileExists(uri: Uri): Promise<boolean>;
    isFileNotFoundError(e: unknown): boolean;
}

async function createDirectory(uri: Uri): Promise<void> {
    return await fs.createDirectory(uri);
}

async function writeFile(uri: Uri, content: string, encoding = 'utf8' as const): Promise<void> {
    const doc = findOpenDocument(uri);
    return doc ? _writeDoc(doc, content) : _writeFile(uri, content, encoding);
}

async function _writeDoc(doc: TextDocument, content: string): Promise<void> {
    const currentText = doc.getText();
    if (currentText === content) return;
    const range = new Range(doc.positionAt(0), doc.positionAt(currentText.length));
    const edit = new WorkspaceEdit();
    edit.replace(doc.uri, range, content);
    await workspace.applyEdit(edit);
    await doc.save();
}

async function _writeFile(uri: Uri, content: string, encoding: 'utf8'): Promise<void> {
    return await fs.writeFile(uri, Buffer.from(content, encoding));
}

async function readFile(uri: Uri, encoding: 'utf8'): Promise<string> {
    return Buffer.from(await fs.readFile(uri)).toString(encoding);
}

async function fileExists(file: Uri): Promise<boolean> {
    try {
        const result = await workspace.fs.stat(file);
        return !!result.type;
    } catch (e) {
        if (!(e instanceof FileSystemError)) throw e;
        return false;
    }
}

function isFileNotFoundError(e: unknown): boolean {
    if (!isErrorCodeException(e)) return false;
    return e.code in FileNotFoundErrorCodes;
}

export function findOpenDocument(uri: Uri): TextDocument | undefined {
    const uriStr = uri.toString(true);
    return workspace.textDocuments.find((doc) => doc.uri.toString(true) === uriStr);
}

export const vscodeFs: VSCodeFs = {
    createDirectory,
    writeFile,
    readFile,
    fileExists,
    isFileNotFoundError,
};
