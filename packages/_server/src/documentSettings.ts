// cSpell:ignore pycache
import { Connection, TextDocumentUri, getWorkspaceFolders, getConfiguration } from './vscode.config';
import * as vscode from 'vscode-languageserver';
import {
    ExcludeFilesGlobMap,
    Glob,
    RegExpPatternDefinition,
    Pattern,
    Settings,
    CSpellSettings,
    BaseSetting,
} from 'cspell-lib';
import * as path from 'path';
import * as fs from 'fs-extra';

import * as CSpell from 'cspell-lib';
import { CSpellUserSettings } from './cspellConfig';
import { URI as Uri } from 'vscode-uri';
import { log, logError } from './util';
import { createAutoLoadCache, AutoLoadCache, LazyValue, createLazyValue } from './autoLoad';
import { GlobMatcher } from 'cspell-glob';
import * as os from 'os';
import { WorkspaceFolder } from 'vscode-languageserver';

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
    '__pycache__/**',   // ignore cache files.
];

const defaultAllowedSchemes = ['file', 'untitled'];
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

    async _getUriSettings(uri: string): Promise<CSpellUserSettings> {
        log('getUriSettings:', uri);
        const r = uri
            ? await this.fetchUriSettings(uri)
            : applyEnableFiletypes(
                extractEnableFiletypes(this.defaultSettings, this.importedSettings()),
                CSpell.mergeSettings(this.defaultSettings, this.importedSettings())
            );
        return r;
    }

    async isExcluded(uri: string): Promise<boolean> {
        const settings = await this.fetchSettingsForUri(uri);
        return settings.globMatcher.match(Uri.parse(uri).path);
    }

    resetSettings() {
        log('resetSettings');
        CSpell.clearCachedSettings();
        this.cachedValues.forEach(cache => cache.clear());
        this._version += 1;
    }

    get folders(): Promise<vscode.WorkspaceFolder[]> {
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
        const folderSettings = await this.fetchSettingsForUri(uri);
        const importedSettings = this.importedSettings();
        const mergedSettings = CSpell.mergeSettings(this.defaultSettings, importedSettings, folderSettings.settings);
        const enabledFiletypes = extractEnableFiletypes(this.defaultSettings, importedSettings, folderSettings.settings);
        const spellSettings = applyEnableFiletypes(enabledFiletypes, mergedSettings);
        const fileUri = Uri.parse(uri);
        const fileSettings = CSpell.calcOverrideSettings(spellSettings, fileUri.fsPath);
        log('Finish fetchUriSettings:', uri);
        return fileSettings;
    }

    private async findMatchingFolder(docUri: string): Promise<vscode.WorkspaceFolder> {
        const root = Uri.parse(docUri || defaultRootUri).with({ path: ''});
        return (await this.matchingFoldersForUri(docUri))[0] || { uri: root.toString(), name: 'root' };
    }

    private async fetchFolders() {
        return (await getWorkspaceFolders(this.connection)) || [];
    }

    private async _fetchVSCodeConfiguration(uri: string) {
        return (await getConfiguration(this.connection, [
            { scopeUri: uri || undefined, section: cSpellSection },
            { section: 'search' }
        ])).map(v => v || {}) as [CSpellUserSettings, VsCodeSettings];
    }

    private async fetchSettingsFromVSCode(uri?: string): Promise<CSpellUserSettings> {
        const configs = await this.fetchVSCodeConfiguration(uri || '');
        const [ cSpell, search ] = configs;
        const { exclude = {} } = search;
        const { ignorePaths = [] } = cSpell;
        const cSpellConfigSettings: CSpellUserSettings = {
            ...cSpell,
            id: 'VSCode-Config',
            ignorePaths: ignorePaths.concat(CSpell.ExclusionHelper.extractGlobsFromExcludeFilesGlobMap(exclude)),
        };
        return cSpellConfigSettings;
    }

    private async _fetchSettingsForUri(docUri: string): Promise<ExtSettings> {
        log(`fetchFolderSettings: URI ${docUri}`);
        const cSpellConfigSettingsRel = await this.fetchSettingsFromVSCode(docUri);
        const cSpellConfigSettings = await this.resolveWorkspacePaths(cSpellConfigSettingsRel, docUri);
        const folder = await this.findMatchingFolder(docUri);
        const cSpellFolderSettings = resolveConfigImports(cSpellConfigSettings, folder.uri);
        const settings = this.readSettingsForFolderUri(folder.uri);
        // cspell.json file settings take precedence over the vscode settings.
        const mergedSettings = CSpell.mergeSettings(cSpellFolderSettings, settings);
        const { ignorePaths = []} = mergedSettings;
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

    private async resolveWorkspacePaths(settings: CSpellUserSettings, docUri: string): Promise<CSpellUserSettings> {
        const folders = await this.folders;
        const folder = await this.findMatchingFolder(docUri);
        const resolver = createWorkspaceNamesResolver(folder, folders);
        return resolveSettings(settings, resolver);
    }

    private async matchingFoldersForUri(docUri: string): Promise<vscode.WorkspaceFolder[]> {
        const folders = await this.folders;
        return folders
            .filter(({uri}) => uri === docUri.slice(0, uri.length))
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
    const paths = workspaceRoot ? [
        path.join(workspaceRoot, '.vscode', CSpell.defaultSettingsFilename.toLowerCase()),
        path.join(workspaceRoot, '.vscode', CSpell.defaultSettingsFilename),
        path.join(workspaceRoot, '.' + CSpell.defaultSettingsFilename.toLowerCase()),
        path.join(workspaceRoot, CSpell.defaultSettingsFilename.toLowerCase()),
        path.join(workspaceRoot, CSpell.defaultSettingsFilename),
    ] : [];
    return paths;
}

function resolveConfigImports(config: CSpellUserSettings, folderUri: string): CSpellUserSettings {
    log('resolveConfigImports:', folderUri);
    const uriFsPath = Uri.parse(folderUri).fsPath;
    const imports = typeof config.import === 'string' ? [config.import] : config.import || [];
    const importAbsPath = imports.map(file => resolvePath(uriFsPath, file));
    log(`resolvingConfigImports: [\n${imports.join('\n')}]`);
    log(`resolvingConfigImports ABS: [\n${importAbsPath.join('\n')}]`);
    const { import: _import, ...result } = importAbsPath.length
        ? CSpell.mergeSettings(readSettingsFiles([...importAbsPath]), config)
        : config;
    return result;
}

function _readSettingsForFolderUri(folderUri: string): CSpellUserSettings {
    return folderUri ? readSettingsFiles(configPathsForRoot(folderUri)) : {};
}

function readSettingsFiles(paths: string[]) {
    log('readSettingsFiles:', paths);
    const existingPaths = paths.filter(filename => exists(filename));
    log('readSettingsFiles actual:', existingPaths);
    return existingPaths.length ? CSpell.readSettingsFiles(existingPaths) : {};
}

function exists(file: string): boolean {
    try {
        const s = fs.statSync(file);
        return s.isFile();
    } catch (e) {}
    return false;
}

function resolvePath(...parts: string[]): string {
    const normalizedParts = parts.map(part => part[0] === '~' ? os.homedir() + part.slice(1) : part);
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
    return schemes.findIndex(v => v === schema) >= 0;
}

function extractEnableFiletypes(...settings: CSpellUserSettings[]): string[] {
    return settings
    .map(({ enableFiletypes = [] }) => enableFiletypes)
    .reduce((acc, next) => acc.concat(next), []);
}

function applyEnableFiletypes(enableFiletypes: string[], settings: CSpellUserSettings): CSpellUserSettings {
    const { enableFiletypes: _, enabledLanguageIds = [], ...rest } = settings;
    const enabled = new Set(enabledLanguageIds);
    enableFiletypes
    .filter(a => !!a)
    .map(a => a.toLowerCase())
    .forEach(lang => {
        if (lang[0] === '!') {
            enabled.delete(lang.slice(1))
        } else {
            enabled.add(lang)
        }
    });
    return enabled.size ? { ...rest, enabledLanguageIds: [...enabled] } : { ...rest };
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

function fixPattern(pat: RegExpPatternDefinition): RegExpPatternDefinition {
    const pattern = fixRegEx(pat.pattern);
    if (pattern === pat.pattern) {
        return pat;
    }
    return {...pat, pattern};
}

export function correctBadSettings(settings: CSpellUserSettings): CSpellUserSettings {
    const newSettings = {...settings};

    // Fix patterns
    newSettings.patterns = newSettings?.patterns?.map(fixPattern);
    newSettings.ignoreRegExpList = newSettings?.ignoreRegExpList?.map(fixRegEx);
    newSettings.includeRegExpList = newSettings?.includeRegExpList?.map(fixRegEx);
    return newSettings;
}

type WorkspacePathResolverFn = (path: string) => string;

interface WorkspacePathResolver {
    resolveFile: WorkspacePathResolverFn;
    resolveGlob: WorkspacePathResolverFn;
}

interface FolderPath {
    name: string;
    path: string;
}

function createWorkspaceNamesResolver(folder: WorkspaceFolder, folders: WorkspaceFolder[]): WorkspacePathResolver {
    return {
        resolveFile: createWorkspaceNamesFilePathResolver(folder, folders),
        resolveGlob: createWorkspaceNamesGlobPathResolver(folder, folders),
    }
}

function createWorkspaceNamesFilePathResolver(folder: WorkspaceFolder, folders: WorkspaceFolder[]): WorkspacePathResolverFn {
    function toFolderPath(w: WorkspaceFolder): FolderPath {
        return {
            name: w.name,
            path: Uri.parse(w.uri).fsPath
        };
    }
    return createWorkspaceNameToPathResolver(
        toFolderPath(folder),
        folders.map(toFolderPath)
    );
}

function createWorkspaceNamesGlobPathResolver(folder: WorkspaceFolder, folders: WorkspaceFolder[]): WorkspacePathResolverFn {
    function toFolderPath(w: WorkspaceFolder): FolderPath {
        return {
            name: w.name,
            path: Uri.parse(w.uri).path
        };
    }
    const rootFolder = toFolderPath(folder);
    const rootPath = rootFolder.path;

    function normalizeToRoot(p: FolderPath) {
        if (p.path.slice(0, rootPath.length) === rootPath) {
            p.path = p.path.slice(rootPath.length);
        }
        return p;
    }

    return createWorkspaceNameToPathResolver(
        normalizeToRoot(rootFolder),
        folders.map(toFolderPath).map(normalizeToRoot)
    );
}

function createWorkspaceNameToPathResolver(folder: FolderPath, folders: FolderPath[]): WorkspacePathResolverFn {
    const folderPairs = [['${workspaceFolder}', folder.path] as [string, string]]
    .concat(folders.map(folder =>
        [ `\${workspaceFolder:${folder.name}}`, folder.path]
    ));
    const map = new Map(folderPairs);
    const regEx = /\$\{workspaceFolder(?:[^}]*)\}/gi;

    return (path: string) => {
        const matches = path.match(regEx);
        if (!matches) {
            return path;
        }
        const parts = path.split(regEx);
        const resultParts = [];
        let i = 0;
        for (i = 0; i < matches.length; ++i) {
            const m = matches[i];
            const v = map.get(m);
            if (v === undefined) {
                logError(`Failed to resolve ${m}`);
            }
            resultParts.push(parts[i]);
            resultParts.push(v ?? m);
        }
        resultParts.push(parts[i]);
        return resultParts.join('');
    };
}

function resolveSettings<T extends CSpellSettings>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
    // Sections
    // - imports
    // - dictionary definitions (also nested in language settings)
    // - globs (ignorePaths and Override filenames)
    // - override dictionaries
    // There is a more elegant way of doing this, but for now just change each section.
    const newSettings = {...resolveCoreSettings(settings, resolver)};
    newSettings.import = resolveImportsToWorkspace(newSettings.import, resolver);
    newSettings.overrides = resolveOverrides(newSettings.overrides, resolver);
    return shallowCleanObject(newSettings);
}

function resolveCoreSettings<T extends Settings>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
    // Sections
    // - imports
    // - dictionary definitions (also nested in language settings)
    // - globs (ignorePaths and Override filenames)
    // - override dictionaries
    const newSettings = {...resolveBaseSettings(settings, resolver)};
    // There is a more elegant way of doing this, but for now just change each section.
    newSettings.dictionaryDefinitions = resolveDictionaryDefinitions(newSettings.dictionaryDefinitions, resolver);
    newSettings.languageSettings = resolveLanguageSettings(newSettings.languageSettings, resolver);
    newSettings.ignorePaths = resolveGlobArray(newSettings.ignorePaths, resolver.resolveGlob);
    return shallowCleanObject(newSettings);
}

function resolveBaseSettings<T extends BaseSetting>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
    const newSettings = {...settings};
    newSettings.dictionaryDefinitions = resolveDictionaryDefinitions(newSettings.dictionaryDefinitions, resolver);
    return shallowCleanObject(newSettings);
}

function resolveImportsToWorkspace(
    imports: CSpellUserSettings['import'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['import'] {
    if (!imports) return imports;
    const toImport = typeof imports === 'string' ? [imports] : imports;
    return toImport.map(resolver.resolveFile);
}

function resolveGlobArray(globs: string[] | undefined, resolver: WorkspacePathResolverFn): undefined | string[] {
    if (!globs) return globs;
    return globs.map(resolver);
}

function resolveDictionaryDefinitions(
    dictDefs: CSpellUserSettings['dictionaryDefinitions'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['dictionaryDefinitions'] {
    if (!dictDefs) return dictDefs;

    return dictDefs
    .map(def => def.path ? {...def, path: resolver.resolveFile(def.path)} : def);
}

function resolveLanguageSettings(
    langSettings: CSpellUserSettings['languageSettings'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['languageSettings'] {
    if (!langSettings) return langSettings;

    return langSettings.map(langSetting => {
        return shallowCleanObject({...resolveBaseSettings(langSetting, resolver)});
    });
}

function resolveOverrides(
    overrides: CSpellUserSettings['overrides'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['overrides'] {
    if (!overrides) return overrides;

    function resolve(path: string | string[]) {
        if (!path) return path;
        return typeof path === 'string' ? resolver.resolveFile(path) : path.map(resolver.resolveFile);
    }

    return overrides.map(src => {
        const dest = {...resolveCoreSettings(src, resolver)};
        dest.filename = resolve(dest.filename);

        return shallowCleanObject(dest);
    });
}

function shallowCleanObject<T>(obj: T): T {
    if (typeof obj !== 'object') return obj;
    const objMap = obj as { [key: string]: any };
    for (const key of Object.keys(objMap)) {
        if (objMap[key] === undefined) {
            delete objMap[key];
        }
    }
    return obj;
}

export const debugExports = {
    fixRegEx,
    fixPattern,
    resolvePath,
    createWorkspaceNamesResolver,
    resolveSettings,
    shallowCleanObject,
};
