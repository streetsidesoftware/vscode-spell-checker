/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// cSpell:ignore pycache
import { TextDocumentUri, getWorkspaceFolders, getConfiguration } from './vscode.config';
import { WorkspaceFolder, Connection } from 'vscode-languageserver/node';
import { Glob, RegExpPatternDefinition, Pattern, CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';
import {
    calcOverrideSettings,
    clearCachedFiles,
    defaultSettingsFilename,
    ExcludeFilesGlobMap,
    ExclusionHelper,
    getSources,
    mergeSettings,
    readSettingsFiles as cspellReadSettingsFiles,
} from 'cspell-lib';
import * as path from 'path';
import * as fs from 'fs-extra';
import { CSpellUserSettings } from '../config/cspellConfig';
import { URI as Uri } from 'vscode-uri';
import { log } from '../utils/log';
import { uniqueFilter } from '../utils';
import { createAutoLoadCache, AutoLoadCache, LazyValue, createLazyValue } from '../utils/autoLoad';
import { GlobMatcher } from 'cspell-glob';
import * as os from 'os';
import { createWorkspaceNamesResolver, resolveSettings } from './WorkspacePathResolver';
import { genSequence } from 'gensequence';

const cSpellSection: keyof SettingsCspell = 'cSpell';

// The settings interface describe the server relevant settings part
export interface SettingsCspell {
    cSpell?: CSpellUserSettings;
}

export interface SettingsVSCode {
    search?: {
        exclude?: ExcludeFilesGlobMap;
    };
}

interface VsCodeSettings {
    [key: string]: any;
}

interface ExtSettings {
    uri: string;
    vscodeSettings: SettingsCspell;
    settings: CSpellUserSettings;
    globMatcher: GlobMatcher;
}

const defaultExclude: Glob[] = [
    '**/*.rendered',
    '**/*.*.rendered',
    '__pycache__/**', // ignore cache files.
];

const defaultAllowedSchemes = ['gist', 'file', 'sftp', 'untitled'];
const schemeBlackList = ['git', 'output', 'debug', 'vscode'];

const defaultRootUri = Uri.file('').toString();

interface Clearable {
    clear: () => any;
}
export class DocumentSettings {
    // Cache per folder settings
    private cachedValues: Clearable[] = [];
    readonly getUriSettings = this.createCache((key: string = '') => this._getUriSettings(key));
    private readonly fetchSettingsForUri = this.createCache((key: string) => this._fetchSettingsForUri(key));
    private readonly _cspellFileSettingsByFolderCache = this.createCache(_readSettingsForFolderUri);
    private readonly fetchVSCodeConfiguration = this.createCache((key: string) => this._fetchVSCodeConfiguration(key));
    private readonly _folders = this.createLazy(() => this.fetchFolders());
    readonly configsToImport = new Set<string>();
    private readonly importedSettings = this.createLazy(() => this._importSettings());
    private _version = 0;

    constructor(readonly connection: Connection, readonly defaultSettings: CSpellUserSettings) {}

    async getSettings(document: TextDocumentUri): Promise<CSpellUserSettings> {
        return this.getUriSettings(document.uri);
    }

    _getUriSettings(uri: string): Promise<CSpellUserSettings> {
        log('getUriSettings:', uri);
        return this.fetchUriSettings(uri || '');
    }

    async isExcluded(uri: string): Promise<boolean> {
        const settings = await this.fetchSettingsForUri(uri);
        return settings.globMatcher.match(Uri.parse(uri).path);
    }

    async calcExcludedBy(uri: string, withSettings?: CSpellUserSettings): Promise<ExcludedByMatch[]> {
        const extSettings = { ...(await this.fetchUriSettingsEx(uri)) };
        extSettings.settings = withSettings || extSettings.settings;

        return calcExcludedBy(uri, extSettings);
    }

    resetSettings() {
        log('resetSettings');
        clearCachedFiles();
        this.cachedValues.forEach((cache) => cache.clear());
        this._version += 1;
    }

    get folders(): Promise<WorkspaceFolder[]> {
        return this._folders();
    }

    private _importSettings() {
        log('importSettings');
        const importPaths = [...this.configsToImport.keys()].sort();
        return readSettingsFiles(importPaths);
    }

    get version() {
        return this._version;
    }

    registerConfigurationFile(path: string) {
        log('registerConfigurationFile:', path);
        this.configsToImport.add(path);
        this.importedSettings.clear();
        this.resetSettings();
    }

    private async fetchUriSettings(uri: string): Promise<CSpellUserSettings> {
        log('Start fetchUriSettings:', uri);
        const exSettings = await this.fetchUriSettingsEx(uri);
        log('Finish fetchUriSettings:', uri);
        return exSettings.settings;
    }

    private async fetchUriSettingsEx(uri: string): Promise<ExtSettings> {
        log('Start fetchUriSettingsEx:', uri);
        const folderSettings = await this.fetchSettingsForUri(uri);
        const importedSettings = this.importedSettings();
        const mergedSettings = mergeSettings(this.defaultSettings, importedSettings, folderSettings.settings);
        const enabledFiletypes = extractEnableFiletypes(this.defaultSettings, importedSettings, folderSettings.settings);
        const spellSettings = applyEnableFiletypes(enabledFiletypes, mergedSettings);
        const fileUri = Uri.parse(uri);
        const fileSettings = calcOverrideSettings(spellSettings, fileUri.fsPath);
        log('Finish fetchUriSettingsEx:', uri);
        return { ...folderSettings, settings: fileSettings };
    }

    private async findMatchingFolder(docUri: string): Promise<WorkspaceFolder> {
        const root = Uri.parse(docUri || defaultRootUri).with({ path: '' });
        return (await this.matchingFoldersForUri(docUri))[0] || { uri: root.toString(), name: 'root' };
    }

    private async fetchFolders() {
        return (await getWorkspaceFolders(this.connection)) || [];
    }

    private async _fetchVSCodeConfiguration(uri: string) {
        return (
            await getConfiguration(this.connection, [{ scopeUri: uri || undefined, section: cSpellSection }, { section: 'search' }])
        ).map((v) => v || {}) as [CSpellUserSettings, VsCodeSettings];
    }

    private async fetchSettingsFromVSCode(uri?: string): Promise<CSpellUserSettings> {
        const configs = await this.fetchVSCodeConfiguration(uri || '');
        const [cSpell, search] = configs;
        const { exclude = {} } = search;
        const { ignorePaths = [] } = cSpell;
        const cSpellConfigSettings: CSpellUserSettings = {
            ...cSpell,
            id: 'VSCode-Config',
            ignorePaths: ignorePaths.concat(ExclusionHelper.extractGlobsFromExcludeFilesGlobMap(exclude)),
        };
        return cSpellConfigSettings;
    }

    private async _fetchSettingsForUri(docUri: string): Promise<ExtSettings> {
        log(`fetchFolderSettings: URI ${docUri}`);
        const cSpellConfigSettingsRel = await this.fetchSettingsFromVSCode(docUri);
        const cSpellConfigSettings = await this.resolveWorkspacePaths(cSpellConfigSettingsRel, docUri);
        const workspaceSettings = await this.loadWorkspaceSettings(cSpellConfigSettings.workspaceRootPath);
        const folder = await this.findMatchingFolder(docUri);
        const cSpellFolderSettings = resolveConfigImports(cSpellConfigSettings, folder.uri);
        const settings = this.readSettingsForFolderUri(folder.uri);
        // cspell.json file settings take precedence over the vscode settings.
        const mergedSettings = mergeSettings(workspaceSettings, cSpellFolderSettings, settings);
        const { ignorePaths = [] } = mergedSettings;
        const globs = defaultExclude.concat(ignorePaths);
        const root = Uri.parse(folder.uri).path;
        const globMatcher = new GlobMatcher(globs, root);

        const ext: ExtSettings = {
            uri: docUri,
            vscodeSettings: { cSpell: cSpellConfigSettings },
            settings: mergedSettings,
            globMatcher,
        };
        return ext;
    }

    private async loadWorkspaceSettings(workspaceRoot: string | undefined): Promise<CSpellUserSettings> {
        if (!workspaceRoot) {
            const rootFolder = (await this.folders)[0];
            if (!rootFolder) return {};

            return this.readSettingsForFolderUri(rootFolder.uri);
        }

        return this.readSettingsForFolderUri(Uri.file(workspaceRoot).toString());
    }

    private async resolveWorkspacePaths(settings: CSpellUserSettings, docUri: string): Promise<CSpellUserSettings> {
        const folders = await this.folders;
        const folder = await this.findMatchingFolder(docUri);
        const resolver = createWorkspaceNamesResolver(folder, folders, settings.workspaceRootPath);
        return resolveSettings(settings, resolver);
    }

    private async matchingFoldersForUri(docUri: string): Promise<WorkspaceFolder[]> {
        const folders = await this.folders;
        return folders
            .filter(({ uri }) => uri === docUri.slice(0, uri.length))
            .sort((a, b) => a.uri.length - b.uri.length)
            .reverse();
    }

    private createCache<K, T>(loader: (key: K) => T): AutoLoadCache<K, T> {
        const cache = createAutoLoadCache(loader);
        this.cachedValues.push(cache);
        return cache;
    }

    private createLazy<T>(loader: () => T): LazyValue<T> {
        const lazy = createLazyValue(loader);
        this.cachedValues.push(lazy);
        return lazy;
    }

    private readSettingsForFolderUri(folderUri: string): CSpellUserSettings {
        return this._cspellFileSettingsByFolderCache.get(folderUri);
    }
}

function configPathsForRoot(workspaceRootUri?: string) {
    const workspaceRoot = workspaceRootUri ? Uri.parse(workspaceRootUri).fsPath : '';
    const paths = workspaceRoot
        ? [
              path.join(workspaceRoot, '.vscode', defaultSettingsFilename.toLowerCase()),
              path.join(workspaceRoot, '.vscode', defaultSettingsFilename),
              path.join(workspaceRoot, '.' + defaultSettingsFilename.toLowerCase()),
              path.join(workspaceRoot, defaultSettingsFilename.toLowerCase()),
              path.join(workspaceRoot, defaultSettingsFilename),
          ]
        : [];
    return paths;
}

function resolveConfigImports(config: CSpellUserSettings, folderUri: string): CSpellUserSettings {
    log('resolveConfigImports:', folderUri);
    const uriFsPath = Uri.parse(folderUri).fsPath;
    const imports = typeof config.import === 'string' ? [config.import] : config.import || [];
    const importAbsPath = imports.map((file) => resolvePath(uriFsPath, file));
    log(`resolvingConfigImports: [\n${imports.join('\n')}]`);
    log(`resolvingConfigImports ABS: [\n${importAbsPath.join('\n')}]`);
    const { import: _import, ...result } = importAbsPath.length ? mergeSettings(readSettingsFiles([...importAbsPath]), config) : config;
    return result;
}

function _readSettingsForFolderUri(folderUri: string): CSpellUserSettings {
    return folderUri ? readSettingsFiles(configPathsForRoot(folderUri)) : {};
}

function readSettingsFiles(paths: string[]) {
    // log('readSettingsFiles:', paths);
    const existingPaths = paths.filter((filename) => exists(filename));
    log('readSettingsFiles:', existingPaths);
    return existingPaths.length ? cspellReadSettingsFiles(existingPaths) : {};
}

function exists(file: string): boolean {
    try {
        const s = fs.statSync(file);
        return s.isFile();
    } catch (e) {}
    return false;
}

function resolvePath(...parts: string[]): string {
    const normalizedParts = parts.map((part) => (part[0] === '~' ? os.homedir() + part.slice(1) : part));
    return path.resolve(...normalizedParts);
}

export function isUriAllowed(uri: string, schemes?: string[]) {
    schemes = schemes || defaultAllowedSchemes;
    return doesUriMatchAnyScheme(uri, schemes);
}

export function isUriBlackListed(uri: string, schemes: string[] = schemeBlackList) {
    return doesUriMatchAnyScheme(uri, schemes);
}

export function doesUriMatchAnyScheme(uri: string, schemes: string[]): boolean {
    const schema = Uri.parse(uri).scheme;
    return schemes.findIndex((v) => v === schema) >= 0;
}

function extractEnableFiletypes(...settings: CSpellUserSettings[]): string[] {
    return settings.map(({ enableFiletypes = [] }) => enableFiletypes).reduce((acc, next) => acc.concat(next), []);
}

function applyEnableFiletypes(enableFiletypes: string[], settings: CSpellUserSettings): CSpellUserSettings {
    const { enableFiletypes: _, enabledLanguageIds = [], ...rest } = settings;
    const enabled = new Set(enabledLanguageIds);
    enableFiletypes
        .filter((a) => !!a)
        .map((a) => a.toLowerCase())
        .forEach((lang) => {
            if (lang[0] === '!') {
                enabled.delete(lang.slice(1));
            } else {
                enabled.add(lang);
            }
        });
    return enabled.size || settings.enabledLanguageIds !== undefined ? { ...rest, enabledLanguageIds: [...enabled] } : { ...rest };
}

const correctRegExMap = new Map([
    ['/"""(.*?\\n?)+?"""/g', '/(""")[^\\1]*?\\1/g'],
    ["/'''(.*?\\n?)+?'''/g", "/(''')[^\\1]*?\\1/g"],
]);

function fixRegEx(pat: Pattern): Pattern {
    if (typeof pat != 'string') {
        return pat;
    }
    return correctRegExMap.get(pat) || pat;
}

function fixRegPattern(pat: Pattern | Pattern[]): Pattern | Pattern[] {
    if (Array.isArray(pat)) {
        return pat.map(fixRegEx);
    }
    return fixRegEx(pat);
}

function fixPattern(pat: RegExpPatternDefinition): RegExpPatternDefinition {
    const pattern = fixRegPattern(pat.pattern);
    if (pattern === pat.pattern) {
        return pat;
    }
    return { ...pat, pattern };
}

export function correctBadSettings(settings: CSpellUserSettings): CSpellUserSettings {
    const newSettings = { ...settings };

    // Fix patterns
    newSettings.patterns = newSettings?.patterns?.map(fixPattern);
    newSettings.ignoreRegExpList = newSettings?.ignoreRegExpList?.map(fixRegEx);
    newSettings.includeRegExpList = newSettings?.includeRegExpList?.map(fixRegEx);
    return newSettings;
}

export function stringifyPatterns(settings: CSpellUserSettings): CSpellUserSettings;
export function stringifyPatterns(settings: undefined): undefined;
export function stringifyPatterns(settings: CSpellUserSettings | undefined): CSpellUserSettings | undefined;
export function stringifyPatterns(settings: CSpellUserSettings | undefined): CSpellUserSettings | undefined {
    if (!settings) return settings;
    const patterns = settings.patterns?.map((pat) => ({ ...pat, pattern: pat.pattern.toString() }));
    return { ...settings, patterns };
}

export const debugExports = {
    fixRegEx: fixRegPattern,
    fixPattern,
    resolvePath,
};

export interface ExcludedByMatch {
    settings: CSpellSettingsWithSourceTrace;
    glob: string;
}

function calcExcludedBy(uri: string, extSettings: ExtSettings) {
    const triedGlobs = new Map<string, boolean>();

    function isExcluded(ex: ExcludedByMatch): boolean {
        const v = triedGlobs.get(ex.glob);
        if (v !== undefined) return v;
        const matcher = new GlobMatcher(ex.glob, extSettings.globMatcher.root);
        const isMatch = matcher.match(uri);
        triedGlobs.set(ex.glob, isMatch);
        return isMatch;
    }

    function keep(cfg: CSpellSettingsWithSourceTrace): boolean {
        return !cfg.source?.sources?.length;
    }

    function id(ex: ExcludedByMatch): string {
        const settings: CSpellSettingsWithSourceTrace = ex.settings;
        return [ex.glob, settings.source?.name, settings.source?.filename, settings.id, settings.name].join('|');
    }

    const matches: ExcludedByMatch[] = genSequence(getSources(extSettings.settings))
        // keep only leaf sources
        .filter(keep)
        .concatMap((settings) => settings.ignorePaths?.map((glob) => ({ glob, settings })) || [])
        .filter(isExcluded)
        .filter(uniqueFilter(id))
        .toArray();
    return matches;
}
