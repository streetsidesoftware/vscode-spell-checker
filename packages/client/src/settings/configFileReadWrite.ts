import { CSpellPackageSettings, CSpellSettings } from '@cspell/cspell-types';
import { parse as parseJson, stringify as stringifyJson, assign as assignJson } from 'comment-json';
import { Uri } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import * as fs from 'fs-extra';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

/**
 * An update function returns the fields to be updated. To remove a field, make it undefined: `{ description: undefined }`
 * Note it is only a top level merge. The update function uses `Object.assign`.
 */
export type ConfigUpdateFn = (cfg: CSpellSettings) => Partial<CSpellSettings>;

type HandlerDef = [
    match: RegExp,
    update: (uri: Uri, updateFn: ConfigUpdateFn) => Promise<void>,
    read: (uri: Uri) => Promise<CSpellSettings>,
    write: (uri: Uri, cfg: CSpellSettings) => Promise<void>
];

const handlers: HandlerDef[] = [
    [/package\.json$/i, updatePackageJson, readPackageJson, writePackageJson],
    [/\.jsonc?$/i, updateCSpellJson, readCSpellJson, writeCSpellJson],
    [/\.ya?ml$/i, updateCSpellYaml, readCSpellYaml, writeCSpellYaml],
];

const spacesJson = 4;

/**
 *
 * @param uri - uri of the configuration file.
 * @param updateFn - function to be called with the config data to be updated.
 *
 * @returns resolves if it was handled.
 */
export async function updateConfigFile(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const handler = mustMatchHandler(uri);
    const [, fn] = handler;
    await fs.mkdirp(Uri.joinPath(uri, '..').fsPath);
    return fn(uri, updateFn);
}

export function readConfigFile(uri: Uri, defaultValueIfNotFound: CSpellSettings): Promise<CSpellSettings>;
export function readConfigFile(uri: Uri, defaultValueIfNotFound?: CSpellSettings): Promise<CSpellSettings | undefined>;
export async function readConfigFile(uri: Uri, defaultValueIfNotFound?: CSpellSettings): Promise<CSpellSettings | undefined> {
    const handler = mustMatchHandler(uri);
    const [, , fn] = handler;
    try {
        return await fn(uri);
    } catch (e) {
        return e.code === 'ENOENT' ? Promise.resolve(defaultValueIfNotFound) : Promise.reject(e);
    }
}

export async function writeConfigFile(uri: Uri, cfg: CSpellSettings): Promise<void> {
    const handler = mustMatchHandler(uri);
    const [, , , fn] = handler;
    await fs.mkdirp(Uri.joinPath(uri, '..').fsPath);
    return fn(uri, cfg);
}

export function isHandled(uri: Uri): boolean {
    return !!matchHandler(uri);
}

function mustMatchHandler(uri: Uri): HandlerDef {
    const handler = matchHandler(uri);
    if (handler) return handler;
    throw new UnhandledFileType(uri);
}

function matchHandler(uri: Uri): HandlerDef | undefined {
    const u = uri.with({ fragment: '', query: '' });
    const s = u.toString();
    for (const h of handlers) {
        const [rTest] = h;
        if (!rTest.test(s)) continue;
        return h;
    }
    return undefined;
}

const settingsFileTemplate: CSpellSettings = {
    version: '0.2',
    ignorePaths: [],
    dictionaryDefinitions: [],
    dictionaries: [],
    words: [],
    ignoreWords: [],
    import: [],
};

interface PackageWithCSpell {
    cspell?: CSpellPackageSettings;
}

async function updatePackageJson(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const fsPath = uri.fsPath;
    const pkg = (await fs.readJson(fsPath)) as PackageWithCSpell;
    const cspell = pkg.cspell || { ...settingsFileTemplate };
    pkg.cspell = Object.assign(cspell, updateFn(cspell));
    return fs.writeJson(fsPath, pkg, { spaces: spacesJson });
}

async function updateCSpellJson(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const cspell = await orDefault(readCSpellJson(uri), settingsFileTemplate);
    const updated = assignJson(cspell, updateFn(cspell));
    return fs.writeFile(uri.fsPath, stringifyJson(updated, null, spacesJson) + '\n');
}

async function updateCSpellYaml(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const cspell = await orDefault(readCSpellYaml(uri), settingsFileTemplate);
    const updated = Object.assign({}, cspell, updateFn(cspell));
    return fs.writeFile(uri.fsPath, stringifyYaml(updated));
}

async function writePackageJson(uri: Uri, cfg: CSpellSettings): Promise<void> {
    const fsPath = uri.fsPath;
    const pkg = (await fs.readJson(fsPath)) as PackageWithCSpell;
    pkg.cspell = cfg;
    return fs.writeJson(fsPath, pkg, { spaces: spacesJson });
}

async function writeCSpellJson(uri: Uri, cfg: CSpellSettings): Promise<void> {
    return fs.writeFile(uri.fsPath, stringifyJson(cfg, null, spacesJson) + '\n');
}

async function writeCSpellYaml(uri: Uri, cfg: CSpellSettings): Promise<void> {
    return fs.writeFile(uri.fsPath, stringifyYaml(cfg));
}

async function readPackageJson(uri: Uri): Promise<CSpellSettings> {
    const content = await fs.readFile(uri.fsPath, 'utf8');
    const pkg = parseJson(content) as { cspell?: CSpellPackageSettings };
    if (!pkg.cspell || typeof pkg.cspell !== 'object') {
        throw new SysLikeError('`cspell` section missing from package.json', 'ENOENT');
    }
    return pkg.cspell;
}

async function readCSpellJson(uri: Uri): Promise<CSpellSettings> {
    const content = await fs.readFile(uri.fsPath, 'utf8');
    return parseJson(content) as CSpellSettings;
}

async function readCSpellYaml(uri: Uri): Promise<CSpellSettings> {
    const content = await fs.readFile(uri.fsPath, 'utf8');
    return parseYaml(content) as CSpellSettings;
}

function orDefault<T>(p: Promise<T>, defaultValue: T): Promise<T> {
    return p.catch((e) => {
        if (e.code !== 'ENOENT') throw e;
        return defaultValue;
    });
}

export class UnhandledFileType extends Error {
    constructor(uri: Uri) {
        super(`Unhandled file type: "${UriUtils.basename(uri)}"`);
    }
}

export class SysLikeError extends Error {
    constructor(msg?: string, readonly code?: string, readonly errno?: number) {
        super(msg);
    }
}

export const __testing__ = {
    settingsFileTemplate,
};
