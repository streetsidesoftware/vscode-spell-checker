import * as path from 'path';
import { Uri } from 'vscode';
import * as fs from 'fs-extra';

export function getUriToSample(baseFilename: string): Uri {
    return Uri.file(path.join(__dirname, '../../samples', baseFilename));
}

export function fsRemove(uri: Uri): Promise<void> {
    return fs.remove(uri.fsPath);
}

export function getPathToTemp(baseFilename: string, testFilename?: string): Uri {
    const callerFile = testFilename ?? getCallStack()[1].file;
    const testFile = path.relative(path.join(__dirname, '../..'), callerFile);
    return Uri.file(path.join(__dirname, '../../temp', testFile, baseFilename));
}

export async function writeFile(file: Uri, content: string): Promise<void> {
    const fsPath = file.fsPath;
    await fs.mkdirp(path.dirname(fsPath));
    return fs.writeFile(fsPath, content, 'utf-8');
}

interface StackItem {
    file: string;
    line: number | undefined;
    column: number | undefined;
}

export function getCallStack(): StackItem[] {
    const reg = /^at.*\((.*)\)$/;
    const err = new Error();
    const lines = mustBeDefined(err.stack)
        .split('\n')
        .map((a) => a.trim())
        .filter((line) => reg.test(line))
        .map((line) => line.match(reg)?.[1])
        .filter(isString);
    const stack: StackItem[] = lines
        .map((line) => line.split(':'))
        .map(([file, ln, col]) => ({ file, line: toNum(ln), column: toNum(col) }));
    return stack.slice(1);
}

export function toNum(n: string | undefined): number | undefined {
    return typeof n === 'string' ? Number.parseInt(n, 10) : undefined;
}

export function isString(s: unknown): s is string {
    return typeof s === 'string';
}

export function mustBeDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('Must Be Defined');
    }
    return t;
}
