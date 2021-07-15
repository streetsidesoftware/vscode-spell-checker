/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// cSpell:ignore pycache
import { TextDocumentUri, getWorkspaceFolders, getConfiguration } from './vscode.config';
import { WorkspaceFolder, Connection } from 'vscode-languageserver/node';
import type {
    Glob,
    RegExpPatternDefinition,
    Pattern,
    CSpellSettingsWithSourceTrace,
    GlobDef,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
} from '@cspell/cspell-types';
import {
    calcOverrideSettings,
    clearCachedFiles,
    ExcludeFilesGlobMap,
    ExclusionHelper,
    getSources,
    mergeSettings,
    readSettingsFiles as cspellReadSettingsFiles,
    searchForConfig,
} from 'cspell-lib';
import * as path from 'path';
import * as fs from 'fs-extra';
import { CSpellUserSettings } from '../config/cspellConfig';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import { log } from '../utils/log';
import { createAutoLoadCache, AutoLoadCache, LazyValue, createLazyValue } from '../utils/autoLoad';
import { GlobMatcher, GlobMatchRule, GlobPatternNormalized } from 'cspell-glob';
import * as os from 'os';
import { createWorkspaceNamesResolver, resolveSettings } from './WorkspacePathResolver';
import { genSequence, Sequence } from 'gensequence';
import { uniqueFilter } from '../utils';
import { VSCodeSettingsCspell } from '../api';
import { extensionId } from '../constants';

// The settings interface describe the server relevant settings part
export interface SettingsCspell extends VSCodeSettingsCspell {}

const cSpellSection: keyof SettingsCspell = extensionId;

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
    excludeGlobMatcher: GlobMatcher;
}

const defaultExclude: Glob[] = [
    '**/*.rendered',
    '**/*.*.rendered',
    '__pycache__/**', // ignore cache files.
];

const defaultAllowedSchemes = ['gist', 'file', 'sftp', 'untitled'];
const schemeBlockList = ['git', 'output', 'debug', 'vscode'];

const defaultRootUri = Uri.file('').toString();

const _defaultSettings: CSpellUserSettings = Object.freeze({});

interface Clearable {
    clear: () => any;
}
export class DocumentSettings {
    // Cache per folder settings
    private cachedValues: Clearable[] = [];
    readonly getUriSettings = this.createCache((key: string = '') => this._getUriSettings(key));
    private readonly fetchSettingsForUri = this.createCache((key: string) => this._fetchSettingsForUri(key));
    private readonly fetchVSCodeConfiguration = this.createCache((key: string) => this._fetchVSCodeConfiguration(key));
    private readonly _folders = this.createLazy(() => this.fetchFolders());
    readonly configsToImport = new Set<string>();
    private readonly importedSettings = this.createLazy(() => this._importSettings());
    private _version = 0;

    constructor(readonly connection: Connection, readonly defaultSettings: CSpellUserSettings = _defaultSettings) {}

    async getSettings(document: TextDocumentUri): Promise<CSpellUserSettings> {
        return this.getUriSettings(document.uri);
    }

    _getUriSettings(uri: string): Promise<CSpellUserSettings> {
        log('getUriSettings:', uri);
        return this.fetchUriSettings(uri || '');
    }

    async isExcluded(uri: string): Promise<boolean> {
        const settings = await this.fetchSettingsForUri(uri);
        return settings.excludeGlobMatcher.match(Uri.parse(uri).fsPath);
    }

    async calcExcludedBy(uri: string): Promise<ExcludedByMatch[]> {
        const extSettings = await this.fetchUriSettingsEx(uri);
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
        const importPaths = [...this.configsToImport].sort();
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
        log('Finish fetchUriSettingsEx:', uri);
        return folderSettings;
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

    public async findCSpellConfigurationFilesForUri(docUri: string | Uri): Promise<Uri[]> {
        const uri = typeof docUri === 'string' ? Uri.parse(docUri) : docUri;
        const docUriAsString = uri.toString();
        const settings = await this.fetchSettingsForUri(docUriAsString);
        return this.extractCSpellConfigurationFiles(settings.settings);
    }

    /**
     * Extract cspell configuration files used as sources to the finalized settings.
     * @param settings - finalized settings
     * @returns config file uri's.
     */
    readonly extractCSpellConfigurationFiles = extractCSpellConfigurationFiles;

    /**
     * Extract file based cspell configurations used to create the finalized settings.
     * @param settings - finalized settings
     * @returns array of Settings
     */
    readonly extractCSpellFileConfigurations = extractCSpellFileConfigurations;

    readonly extractTargetDictionaries = extractTargetDictionaries;

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
        const uri = Uri.parse(docUri);
        const fsPath = path.normalize(uri.fsPath);
        const cSpellConfigSettingsRel = await this.fetchSettingsFromVSCode(docUri);
        const cSpellConfigSettings = await this.resolveWorkspacePaths(cSpellConfigSettingsRel, docUri);
        const settings = await searchForConfig(fsPath);
        const folder = await this.findMatchingFolder(docUri);
        const cSpellFolderSettings = resolveConfigImports(cSpellConfigSettings, folder.uri);

        const settingsToMerge: CSpellUserSettings[] = [];
        if (this.defaultSettings !== _defaultSettings) {
            settingsToMerge.push(this.defaultSettings);
        }
        settingsToMerge.push(this.importedSettings());
        settingsToMerge.push(cSpellFolderSettings);
        if (settings) {
            settingsToMerge.push(settings);
        }

        const mergedSettings = mergeSettings(settingsToMerge[0], ...settingsToMerge.slice(1));

        const enabledFiletypes = extractEnableFiletypes(mergedSettings);
        const spellSettings = applyEnableFiletypes(enabledFiletypes, mergedSettings);
        const fileSettings = calcOverrideSettings(spellSettings, fsPath);
        const { ignorePaths = [] } = fileSettings;

        const globs = defaultExclude.concat(ignorePaths);
        const root = Uri.parse(folder.uri).fsPath;
        const globMatcher = new GlobMatcher(globs, root);

        const ext: ExtSettings = {
            uri: docUri,
            vscodeSettings: { cSpell: cSpellConfigSettings },
            settings: fileSettings,
            excludeGlobMatcher: globMatcher,
        };
        return ext;
    }

    private async resolveWorkspacePaths(settings: CSpellUserSettings, docUri: string): Promise<CSpellUserSettings> {
        const folders = await this.folders;
        const folder = await this.findMatchingFolder(docUri);
        const resolver = createWorkspaceNamesResolver(folder, folders, settings.workspaceRootPath);
        return resolveSettings(settings, resolver);
    }

    public async matchingFoldersForUri(docUri: string): Promise<WorkspaceFolder[]> {
        const folders = await this.folders;
        return _matchingFoldersForUri(folders, docUri);
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
}

function resolveConfigImports(config: CSpellUserSettings, folderUri: string): CSpellUserSettings {
    log('resolveConfigImports:', folderUri);
    const uriFsPath = path.normalize(Uri.parse(folderUri).fsPath);
    const imports = typeof config.import === 'string' ? [config.import] : config.import || [];
    const importAbsPath = imports.map((file) => resolvePath(uriFsPath, file));
    log(`resolvingConfigImports: [\n${imports.join('\n')}]`);
    log(`resolvingConfigImports ABS: [\n${importAbsPath.join('\n')}]`);
    const { import: _import, ...result } = importAbsPath.length ? mergeSettings(readSettingsFiles([...importAbsPath]), config) : config;
    return result;
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

export function isUriBlocked(uri: string, schemes: string[] = schemeBlockList) {
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
    normalizeEnableFiletypes(enableFiletypes).forEach((lang) => {
        if (lang[0] === '!') {
            enabled.delete(lang.slice(1));
        } else {
            enabled.add(lang);
        }
    });
    return enabled.size || settings.enabledLanguageIds !== undefined ? { ...rest, enabledLanguageIds: [...enabled] } : { ...rest };
}

function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
    const ids = enableFiletypes
        .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
        .sort()
        .map((id) => id.replace(/~/g, '!')) // Restore the !
        .map((id) => id.replace(/^(!!)+/, '')); // Remove extra !! pairs

    return ids;
}

function _matchingFoldersForUri(folders: WorkspaceFolder[], docUri: string): WorkspaceFolder[] {
    return folders.filter(({ uri }) => docUri.startsWith(uri)).sort((a, b) => b.uri.length - a.uri.length);
}

function filterFnConfigFilesToMatchInheritedPath(dir: Uri): (uri: Uri) => boolean {
    const inheritPath = dir.toString();
    return (cfgUri) => {
        const uriConfDir = UriUtils.dirname(cfgUri);
        if (inheritPath.startsWith(uriConfDir.toString())) {
            return true;
        }
        return UriUtils.basename(uriConfDir) === '.vscode' && inheritPath.startsWith(UriUtils.dirname(uriConfDir).toString());
    };
}

function filterConfigFilesToMatchInheritedPathOfFile(configFiles: Uri[], file: Uri): Uri[] {
    const fnFilter = filterFnConfigFilesToMatchInheritedPath(UriUtils.dirname(file));
    return configFiles.filter(fnFilter);
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
    filterConfigFilesToMatchInheritedPathOfFile,
};

export interface ExcludedByMatch {
    settings: CSpellSettingsWithSourceTrace;
    glob: Glob;
}

function calcExcludedBy(uri: string, extSettings: ExtSettings): ExcludedByMatch[] {
    const filename = path.normalize(Uri.parse(uri).fsPath);
    const matchResult = extSettings.excludeGlobMatcher.matchEx(filename);

    if (matchResult.matched === false) {
        return [];
    }

    const glob = extractGlobDef(matchResult);

    function isExcluded(ex: ExcludedByMatch): boolean {
        return areGlobsEqual(glob, ex.glob);
    }

    function keep(cfg: CSpellSettingsWithSourceTrace): boolean {
        return !cfg.source?.sources?.length;
    }

    const ex: Sequence<ExcludedByMatch> = genSequence(getSources(extSettings.settings))
        // keep only leaf sources
        .filter(keep)
        .filter(uniqueFilter())
        .concatMap((settings) => settings.ignorePaths?.map((glob) => ({ glob, settings })) || []);

    const matches: ExcludedByMatch[] = ex.filter(isExcluded).toArray();
    return matches;
}

function extractGlobDef(match: GlobMatchRule): GlobDef {
    return {
        glob: (<GlobPatternNormalized>match.pattern).rawGlob || match.pattern.glob || match.glob,
        root: (<GlobPatternNormalized>match.pattern).rawRoot || match.pattern.root || match.root,
    };
}

function areGlobsEqual(globA: Glob, globB: Glob): boolean {
    globA = toGlobDef(globA);
    globB = toGlobDef(globB);
    return globA.glob === globB.glob && globA.root === globB.root;
}

function toGlobDef(g: Glob): GlobDef {
    return typeof g === 'string' ? { glob: g } : g;
}

type Source = Exclude<CSpellSettingsWithSourceTrace['source'], undefined>;

interface FileSource extends Source {
    filename: Exclude<Source['filename'], undefined>;
}

interface CSpellSettingsWithFileSource extends CSpellSettingsWithSourceTrace {
    source: FileSource;
}

function isCSpellSettingsWithFileSource(s: CSpellUserSettings | CSpellSettingsWithFileSource): s is CSpellSettingsWithFileSource {
    return !!(<CSpellSettingsWithSourceTrace>s).source?.filename;
}

/**
 * Extract cspell configuration files used as sources to the finalized settings.
 * @param settings - finalized settings
 * @returns config file uri's.
 */
function extractCSpellConfigurationFiles(settings: CSpellUserSettings): Uri[] {
    const configs = extractCSpellFileConfigurations(settings);
    return configs.map(({ source }) => Uri.file(source.filename));
}

const regExIsOwnedByCspell = /@cspell\b/;
const regExIsOwnedByExtension = /\bstreetsidesoftware\.code-spell-checker\b/;

/**
 * Extract file based cspell configurations used to create the finalized settings.
 * @param settings - finalized settings
 * @returns array of Settings
 */
export function extractCSpellFileConfigurations(settings: CSpellUserSettings): CSpellSettingsWithFileSource[] {
    const sources = getSources(settings);
    const configs = sources
        .filter(isCSpellSettingsWithFileSource)
        .filter(({ source }) => !regExIsOwnedByCspell.test(source.filename))
        .filter(({ source }) => !regExIsOwnedByExtension.test(source.filename))
        .reverse();

    return configs;
}

/**
 *
 * @param settings - finalized settings
 * @returns
 */
export function extractTargetDictionaries(settings: CSpellUserSettings): DictionaryDefinitionCustom[] {
    const { dictionaries = [], dictionaryDefinitions = [] } = settings;
    const defs = new Map(dictionaryDefinitions.map((d) => [d.name, d]));
    const activeDicts = dictionaries.map((name) => defs.get(name)).filter(isDefined);
    const regIsTextFile = /\.txt$/;
    const targetDicts = activeDicts
        .filter(isDictionaryDefinitionCustom)
        .filter((d) => regIsTextFile.test(d.path) && d.addWords)
        .filter((d) => !regExIsOwnedByCspell.test(d.path))
        .filter((d) => !regExIsOwnedByExtension.test(d.path));
    return targetDicts;
}

function isDictionaryDefinitionCustom(d: DictionaryDefinition): d is DictionaryDefinitionCustom {
    return d.file === undefined && !!d.path && (<DictionaryDefinitionCustom>d).addWords;
}

function isDefined<T>(t: T | undefined): t is T {
    return t !== undefined && t !== null;
}

export const __testing__ = {
    extractTargetDictionaries,
    extractEnableFiletypes,
    normalizeEnableFiletypes,
    applyEnableFiletypes,
};
