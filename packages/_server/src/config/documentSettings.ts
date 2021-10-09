import type {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    FileSource,
    Glob,
    GlobDef,
    Pattern,
    RegExpPatternDefinition,
} from '@cspell/cspell-types';
import { AutoLoadCache, createAutoLoadCache, createLazyValue, LazyValue } from 'common-utils/autoLoad.js';
import { toUri } from 'common-utils/uriHelper.js';
import { log } from 'common-utils/log.js';
import { GitIgnore, findRepoRoot } from 'cspell-gitignore';
import { GlobMatcher, GlobMatchRule, GlobPatternNormalized } from 'cspell-glob';
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
import * as fs from 'fs-extra';
import { genSequence, Sequence } from 'gensequence';
import * as os from 'os';
import * as path from 'path';
import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';
import { VSCodeSettingsCspell } from '../api';
import { CSpellUserSettings } from '../config/cspellConfig';
import { extensionId } from '../constants';
import { uniqueFilter } from '../utils';
import { getConfiguration, getWorkspaceFolders, TextDocumentUri } from './vscode.config';
import { createWorkspaceNamesResolver, resolveSettings } from './WorkspacePathResolver';

// The settings interface describe the server relevant settings part
export interface SettingsCspell extends VSCodeSettingsCspell {}

const cSpellSection: keyof SettingsCspell = extensionId;

type FsPath = string;
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
    includeGlobMatcher: GlobMatcher;
}

type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never;
type GitignoreResultP = ReturnType<GitIgnore['isIgnoredEx']>;
type GitignoreResultInfo = PromiseType<GitignoreResultP>;

export interface ExcludeIncludeIgnoreInfo {
    include: boolean;
    exclude: boolean;
    ignored: boolean | undefined;
    gitignoreInfo: GitignoreResultInfo | undefined;
}

const defaultExclude: Glob[] = [
    '**/*.rendered',
    '__pycache__/**', // ignore cache files. cspell:ignore pycache
];

const defaultAllowedSchemes = ['gist', 'file', 'sftp', 'untitled', 'vscode-notebook-cell'];
const schemeBlockList = ['git', 'output', 'debug', 'vscode'];

const defaultRootUri = Uri.file('').toString();

const _defaultSettings: CSpellUserSettings = Object.freeze({});

const _schemaMapToFile = {
    'vscode-notebook-cell': true,
} as const;

const schemeMapToFile: Record<string, true> = Object.freeze(_schemaMapToFile);

interface Clearable {
    clear: () => any;
}
export class DocumentSettings {
    // Cache per folder settings
    private cachedValues: Clearable[] = [];
    private readonly fetchSettingsForUri = this.createCache((key: string) => this._fetchSettingsForUri(key));
    private readonly fetchVSCodeConfiguration = this.createCache((key: string) => this._fetchVSCodeConfiguration(key));
    private readonly fetchRepoRootForDir = this.createCache((dir: FsPath) => findRepoRoot(dir));
    private readonly _folders = this.createLazy(() => this.fetchFolders());
    readonly configsToImport = new Set<string>();
    private readonly importedSettings = this.createLazy(() => this._importSettings());
    private _version = 0;
    private gitIgnore = new GitIgnore();

    constructor(readonly connection: Connection, readonly defaultSettings: CSpellUserSettings = _defaultSettings) {}

    async getSettings(document: TextDocumentUri): Promise<CSpellUserSettings> {
        return this.getUriSettings(document.uri);
    }

    getUriSettings(uri: string): Promise<CSpellUserSettings> {
        return this.fetchUriSettings(uri);
    }

    async calcIncludeExclude(uri: Uri): Promise<ExcludeIncludeIgnoreInfo> {
        const settings = await this.fetchSettingsForUri(uri.toString());
        const ie = calcIncludeExclude(settings, uri);
        const ignoredEx = await this._isGitIgnoredEx(settings, uri);
        return {
            ...ie,
            ignored: ignoredEx?.matched,
            gitignoreInfo: ignoredEx,
        };
    }

    async isExcluded(uri: string): Promise<boolean> {
        const settings = await this.fetchSettingsForUri(uri);
        return isExcluded(settings, Uri.parse(uri));
    }

    /**
     * If `useGitIgnore` is true, checks to see if a uri matches a `.gitignore` file glob.
     * @param uri - file uri
     * @returns `useGitignore` && the file matches a `.gitignore` file glob.
     */
    async isGitIgnored(uri: Uri): Promise<boolean | undefined> {
        const extSettings = await this.fetchUriSettingsEx(uri.toString());
        return this._isGitIgnored(extSettings, uri);
    }

    /**
     * If `useGitIgnore` is true, checks to see if a uri matches a `.gitignore` file glob.
     * @param uri - file uri
     * @returns
     *   - `undefined` if `useGitignore` is falsy. -- meaning we do not know.
     *   - `true` if it is ignored
     *   - `false` otherwise
     */
    private async _isGitIgnored(extSettings: ExtSettings, uri: Uri): Promise<boolean | undefined> {
        if (!extSettings.settings.useGitignore) return undefined;
        return await this.gitIgnore.isIgnored(uri.fsPath);
    }

    /**
     * If `useGitIgnore` is true, checks to see if a uri matches a `.gitignore` file glob.
     * @param uri - file uri
     * @returns
     *   - `undefined` if `useGitignore` is falsy. -- meaning we do not know.
     *   - `true` if it is ignored
     *   - `false` otherwise
     */
    private async _isGitIgnoredEx(extSettings: ExtSettings, uri: Uri): Promise<GitignoreResultInfo | undefined> {
        if (!extSettings.settings.useGitignore) return undefined;
        const root = await this.fetchRepoRootForFile(uri);
        if (root) {
            this.gitIgnore.addRoots([root]);
        }
        return await this.gitIgnore.isIgnoredEx(uri.fsPath);
    }

    async calcExcludedBy(uri: string): Promise<ExcludedByMatch[]> {
        const extSettings = await this.fetchUriSettingsEx(uri);
        return calcExcludedBy(uri, extSettings);
    }

    resetSettings(): void {
        log('resetSettings');
        clearCachedFiles();
        this.cachedValues.forEach((cache) => cache.clear());
        this._version += 1;
        this.gitIgnore = new GitIgnore();
    }

    get folders(): Promise<WorkspaceFolder[]> {
        return this._folders();
    }

    private _importSettings() {
        log('importSettings');
        const importPaths = [...this.configsToImport].sort();
        return readSettingsFiles(importPaths);
    }

    get version(): number {
        return this._version;
    }

    registerConfigurationFile(path: string): void {
        log('registerConfigurationFile:', path);
        this.configsToImport.add(path);
        this.importedSettings.clear();
        this.resetSettings();
    }

    private async fetchUriSettings(uri: string): Promise<CSpellUserSettings> {
        const exSettings = await this.fetchUriSettingsEx(uri);
        return exSettings.settings;
    }

    private fetchUriSettingsEx(uri: string): Promise<ExtSettings> {
        return this.fetchSettingsForUri(uri);
    }

    private async findMatchingFolder(docUri: string, defaultTo: WorkspaceFolder): Promise<WorkspaceFolder>;
    private async findMatchingFolder(docUri: string, defaultTo?: WorkspaceFolder | undefined): Promise<WorkspaceFolder | undefined>;
    private async findMatchingFolder(docUri: string, defaultTo: WorkspaceFolder | undefined): Promise<WorkspaceFolder | undefined> {
        return (await this.matchingFoldersForUri(docUri))[0] || defaultTo;
    }

    private rootForUri(docUri: string | undefined) {
        return Uri.parse(docUri || defaultRootUri).with({ path: '' });
    }

    private rootFolderForUri(docUri: string | undefined) {
        const root = this.rootForUri(docUri);
        return { uri: root.toString(), name: 'root' };
    }

    private async fetchFolders() {
        return (await getWorkspaceFolders(this.connection)) || [];
    }

    private async _fetchVSCodeConfiguration(uri: string) {
        const [cSpell, search] = (
            await getConfiguration(this.connection, [{ scopeUri: uri || undefined, section: cSpellSection }, { section: 'search' }])
        ).map((v) => v || {}) as [CSpellUserSettings, VsCodeSettings];

        return { cSpell, search };
    }

    private async fetchRepoRootForFile(uriFile: string | Uri) {
        const u = toUri(uriFile);
        const uriDir = UriUtils.dirname(u);
        return this.fetchRepoRootForDir(uriDir.fsPath);
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
        const { cSpell, search } = await this.fetchVSCodeConfiguration(uri || '');
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
        if (uri.scheme in schemeMapToFile) {
            return this.fetchSettingsForUri(mapToFileUri(uri).toString());
        }
        const fsPath = path.normalize(uri.fsPath);
        const cSpellConfigSettingsRel = await this.fetchSettingsFromVSCode(docUri);
        const cSpellConfigSettings = await this.resolveWorkspacePaths(cSpellConfigSettingsRel, docUri);
        const settings = await searchForConfig(fsPath);
        const rootFolder = this.rootFolderForUri(docUri);
        const folders = await this.folders;
        const folder = await this.findMatchingFolder(docUri, rootFolder);
        const cSpellFolderSettings = resolveConfigImports(cSpellConfigSettings, folder.uri);
        const globRootFolder = folder !== rootFolder ? folder : folders[0] || folder;

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
        const { ignorePaths = [], files = [] } = fileSettings;

        const globRoot = Uri.parse(globRootFolder.uri).fsPath;
        if (!files.length && cSpellConfigSettings.spellCheckOnlyWorkspaceFiles !== false) {
            // Add file globs that will match the entire workspace.
            files.push({ glob: '**', root: globRoot });
            files.push({ glob: '**/.*', root: globRoot });
            files.push({ glob: '**/.*/**', root: globRoot });
        }
        fileSettings.files = files;

        const globs = ignorePaths.concat(defaultExclude);
        const excludeGlobMatcher = new GlobMatcher(globs, globRoot);
        const includeGlobMatcher = new GlobMatcher(files, { root: globRoot, mode: 'include' });

        const ext: ExtSettings = {
            uri: docUri,
            vscodeSettings: { cSpell: cSpellConfigSettings },
            settings: fileSettings,
            excludeGlobMatcher,
            includeGlobMatcher,
        };
        return ext;
    }

    private async resolveWorkspacePaths(settings: CSpellUserSettings, docUri: string): Promise<CSpellUserSettings> {
        const folders = await this.folders;
        const folder = (await this.findMatchingFolder(docUri)) || folders[0] || this.rootFolderForUri(docUri);
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

export function isUriAllowed(uri: string, schemes?: string[]): boolean {
    schemes = schemes || defaultAllowedSchemes;
    return doesUriMatchAnyScheme(uri, schemes);
}

export function isUriBlocked(uri: string, schemes: string[] = schemeBlockList): boolean {
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

export interface CSpellSettingsWithFileSource extends CSpellSettingsWithSourceTrace {
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

export function calcIncludeExclude(settings: ExtSettings, uri: Uri): { include: boolean; exclude: boolean } {
    return {
        include: isIncluded(settings, uri),
        exclude: isExcluded(settings, uri),
    };
}

export function isIncluded(settings: ExtSettings, uri: Uri): boolean {
    const files = settings.settings.files;
    return !files?.length || settings.includeGlobMatcher.match(uri.fsPath);
}

export function isExcluded(settings: ExtSettings, uri: Uri): boolean {
    return settings.excludeGlobMatcher.match(uri.fsPath);
}

function mapToFileUri(uri: Uri): Uri {
    return uri.with({
        scheme: 'file',
        query: '',
        fragment: '',
    });
}

export const __testing__ = {
    extractTargetDictionaries,
    extractEnableFiletypes,
    normalizeEnableFiletypes,
    applyEnableFiletypes,
};
