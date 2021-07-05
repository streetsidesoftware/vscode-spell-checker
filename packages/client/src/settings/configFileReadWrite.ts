import { CSpellPackageSettings, CSpellSettings } from '@cspell/cspell-types';
import { parse as parseJson, stringify as stringifyJson } from 'comment-json';
import { Uri } from 'vscode';
import { Utils as UriUtils } from 'vscode-uri';
import * as fs from 'fs-extra';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type ConfigUpdateFn = (cfg: CSpellSettings) => CSpellSettings;

type HandlerDef = [
    match: RegExp,
    update: (uri: Uri, updateFn: ConfigUpdateFn) => Promise<void>,
    read: (uri: Uri) => Promise<CSpellSettings>
];

const handlers: HandlerDef[] = [
    [/package\.json$/i, updatePackageJson, readPackageJson],
    [/\.jsonc?$/i, updateCSpellJson, readCSpellJson],
    [/\.ya?ml$/i, updateCSpellYaml, readCSpellYaml],
];

/**
 *
 * @param uri - uri of the configuration file.
 * @param updateFn - function to be called with the config data to be updated.
 *   Note: it is ok to update the cspell config object in place. It will help with
 *   preserving comments. But it is necessary to return the resulting object.
 * @returns resolves to true if it was handled.
 */
export async function updateConfigFile(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const fsPath = uri.fsPath;
    for (const [rTest, fn] of handlers) {
        if (!rTest.test(fsPath)) continue;
        await fs.mkdirp(Uri.joinPath(uri, '..').fsPath);
        return fn(uri, updateFn);
    }
    throw new UnhandledFileType(uri);
}

export function readConfigFile(uri: Uri, defaultValueIfNotFound: CSpellSettings): Promise<CSpellSettings>;
export function readConfigFile(uri: Uri, defaultValueIfNotFound?: CSpellSettings): Promise<CSpellSettings | undefined>;
export async function readConfigFile(uri: Uri, defaultValueIfNotFound?: CSpellSettings): Promise<CSpellSettings | undefined> {
    const fsPath = uri.fsPath;
    for (const [rTest, , fn] of handlers) {
        if (!rTest.test(fsPath)) continue;
        try {
            return await fn(uri);
        } catch (e) {
            if (e.code === 'ENOENT') return defaultValueIfNotFound;
            throw e;
        }
    }
    throw new UnhandledFileType(uri);
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

async function updatePackageJson(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const fsPath = uri.fsPath;
    const pkg = (await fs.readJson(fsPath)) as { cspell?: CSpellPackageSettings };

    pkg.cspell = updateFn(pkg.cspell || { ...settingsFileTemplate });

    return fs.writeJson(fsPath, pkg, { spaces: 4 });
}

async function updateCSpellJson(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const cspell = await readCSpellJson(uri).catch((e) => {
        if (e.code !== 'ENOENT') throw e;
        return settingsFileTemplate;
    });
    const updated = updateFn(cspell);
    return fs.writeFile(uri.fsPath, stringifyJson(updated) + '\n');
}

async function updateCSpellYaml(uri: Uri, updateFn: ConfigUpdateFn): Promise<void> {
    const cspell = await readCSpellYaml(uri).catch((e) => {
        if (e.code !== 'ENOENT') throw e;
        return settingsFileTemplate;
    });
    const updated = updateFn(cspell);
    return fs.writeFile(uri.fsPath, stringifyYaml(updated));
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
