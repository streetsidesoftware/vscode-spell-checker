import { mustBeDefined } from '@internal/common-utils/util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Uri } from 'vscode';

import { isDefined } from '../util';
import type { PackageJson } from '../vscode/packageJson';

export { isDefined } from '../util';
export { mustBeDefined } from '@internal/common-utils/util';

const rootClient = path.join(__dirname, '../..');
const root = path.join(rootClient, '../..');
const tempClient = path.join(rootClient, 'temp');

export function getUriToSample(baseFilename: string): Uri {
    return Uri.file(path.join(rootClient, 'samples', baseFilename));
}

export async function readExtensionPackage(): Promise<PackageJson> {
    const pkgContents = await fs.readFile(path.join(root, 'package.json'), 'utf8');
    return JSON.parse(pkgContents);
}

export function fsRemove(uri: Uri): Promise<void> {
    return fs.rm(uri.fsPath, { force: true, recursive: true });
}

export function testNameToDir(testName: string): string {
    return `test_${testName.replace(/\s/g, '-').replace(/[^\w.-]/gi, '_')}_test`;
}

/**
 * Calculate a Uri for a path to a temporary directory that will be unique to the current test.
 * Note: if a text is not currently running, then it is the path for the test file.
 * @param baseFilename - name of file / directory wanted
 * @param testFilename - optional full path to a test file.
 * @returns Uri to the requested temp file.
 */
export function getPathToTemp(baseFilename = '.', testFilename?: string): Uri {
    const testState = expect.getState();
    const callerFile = testFilename ?? testState.testPath ?? getCallStack()[1].file;
    const testFile = path.relative(rootClient, callerFile);
    expect.getState();
    const testName = testState.currentTestName || '.';
    const testDirName = testNameToDir(testName);
    return Uri.file(path.join(tempClient, testFile, testDirName, baseFilename));
}

export async function mkdirUri(uri: Uri): Promise<void> {
    await fs.mkdir(uri.fsPath, { recursive: true });
}

export async function writeFile(file: Uri, content: string): Promise<void> {
    const fsPath = file.fsPath;
    await fs.mkdir(path.dirname(fsPath), { recursive: true });
    return fs.writeFile(fsPath, content, 'utf-8');
}

export async function writeJson(file: Uri, content: unknown): Promise<void> {
    return writeFile(file, JSON.stringify(content, null, 4) + '\n');
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
    const regParts = /^(.*):(\d+):(\d+)$/;
    const lines = stackTrace
        .split('\n')
        .map((a) => a.trim())
        .map((line) => line.match(regStackLine)?.[1])
        .filter(isString)
        .map((line) => extractBetween(line, '(', ')') || line)
        .filter(isString);
    const stack: StackItem[] = lines
        .map((line) => line.match(regParts))
        .filter(isDefined)
        .map(([_, file, ln, col]) => ({ file, line: toNum(ln), column: toNum(col) }));
    return stack.slice(1);
}

function extractBetween(line: string, start: string, end: string): string {
    const iS = line.indexOf(start);
    if (iS < 0) return '';
    const iE = line.indexOf(end, iS + 1);
    if (iE < 0) return '';
    return line.slice(iS + 1, iE);
}

export function toNum(n: string | undefined): number | undefined {
    return typeof n === 'string' ? Number.parseInt(n, 10) : undefined;
}

export function isString(s: unknown): s is string {
    return typeof s === 'string';
}

export const oc = expect.objectContaining;
