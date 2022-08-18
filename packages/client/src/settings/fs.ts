import { Uri, workspace } from 'vscode';

const fs = workspace.fs;

interface VSCodeFs {
    createDirectory(uri: Uri): Promise<void>;
    writeFile(uri: Uri, content: string, encoding?: 'utf8'): Promise<void>;
    readFile(uri: Uri, encoding: 'utf8'): Promise<string>;
}

async function createDirectory(uri: Uri): Promise<void> {
    return await fs.createDirectory(uri);
}

async function writeFile(uri: Uri, content: string, encoding = 'utf8' as const): Promise<void> {
    return await fs.writeFile(uri, Buffer.from(content, encoding));
}

async function readFile(uri: Uri, encoding: 'utf8'): Promise<string> {
    return Buffer.from(await fs.readFile(uri)).toString(encoding);
}

export const vscodeFs: VSCodeFs = {
    createDirectory,
    writeFile,
    readFile,
};
