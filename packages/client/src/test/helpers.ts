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

export function mkdirp(uri: Uri): Promise<void> {
    return fs.mkdirp(uri.fsPath);
}

export async function writeFile(file: Uri, content: string): Promise<void> {
    const fsPath = file.fsPath;
    await fs.mkdirp(path.dirname(fsPath));
    return fs.writeFile(fsPath, content, 'utf-8');
}

export async function readFile(file: Uri): Promise<string> {
    const fsPath = file.fsPath;
    return fs.readFile(fsPath, 'utf-8');
}

export interface StackItem {
    file: string;
    line: number | undefined;
    column: number | undefined;
}

export function getCallStack(): StackItem[] {
    const err = new Error();
    return parseStackTrace(mustBeDefined(err.stack));
}

export function parseStackTrace(stackTrace: string): StackItem[] {
    const regStackLine = /^at\s+(.*)/;
    const regStackFile = /\((.*)\)$/;
    const regParts = /^(.*):(\d+):(\d+)$/;
    const lines = stackTrace
        .split('\n')
        .map((a) => a.trim())
        .map((line) => line.match(regStackLine)?.[1])
        .filter(isString)
        .map((line) => line.match(regStackFile)?.[1] || line)
        .filter(isString);
    const stack: StackItem[] = lines
        .map((line) => line.match(regParts))
        .filter(isDefined)
        .map(([_, file, ln, col]) => ({ file, line: toNum(ln), column: toNum(col) }));
    return stack.slice(1);
}

export function toNum(n: string | undefined): number | undefined {
    return typeof n === 'string' ? Number.parseInt(n, 10) : undefined;
}

export function isString(s: unknown): s is string {
    return typeof s === 'string';
}

export function isDefined<T>(t: T | undefined | null): t is T {
    return t !== undefined && t !== null;
}

export function mustBeDefined<T>(t: T | undefined): T {
    if (t === undefined) {
        throw new Error('Must Be Defined');
    }
    return t;
}
