import { opConcatMap, opFilter, pipe } from '@cspell/cspell-pipe/sync';
import type {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
    FileSource,
    Glob,
    GlobDef,
    Pattern,
    RegExpPatternDefinition,
} from '@cspell/cspell-types';
import { setIfDefined } from '@internal/common-utils';
import type { AutoLoadCache, LazyValue } from '@internal/common-utils/autoLoad';
import { createAutoLoadCache, createLazyValue } from '@internal/common-utils/autoLoad';
import { log } from '@internal/common-utils/log';
import { toFileUri, toUri } from '@internal/common-utils/uriHelper';
import { findRepoRoot, GitIgnore } from 'cspell-gitignore';
import type { GlobMatchOptions, GlobMatchRule, GlobPatternNormalized } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';
import type { ExcludeFilesGlobMap } from 'cspell-lib';
import {
    calcOverrideSettings,
    clearCachedFiles,
    ExclusionHelper,
    getSources,
    mergeSettings,
    readSettings as cspellReadSettingsFile,
    searchForConfig,
} from 'cspell-lib';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { Connection, WorkspaceFolder } from 'vscode-languageserver/node.js';
import { URI as Uri, Utils as UriUtils } from 'vscode-uri';

import type { DocumentUri, ServerSideApi, VSCodeSettingsCspell, WorkspaceConfigForDocument } from '../api.js';
import { extensionId } from '../constants.mjs';
import { uniqueFilter } from '../utils/index.mjs';
import { filterMergeFields } from './cspellConfig/cspellMergeFields.mjs';
import type { CSpellUserSettings } from './cspellConfig/index.mjs';
import { canAddWordsToDictionary } from './customDictionaries.mjs';
import { handleSpecialUri } from './docUriHelper.mjs';
import type { TextDocumentUri } from './vscode.config.mjs';
import { getConfiguration, getWorkspaceFolders } from './vscode.config.mjs';
import { createWorkspaceNamesResolver, resolveSettings } from './WorkspacePathResolver.mjs';

// The settings interface describe the server relevant settings part
export type SettingsCspell = VSCodeSettingsCspell;

const cSpellSection: keyof SettingsCspell = extensionId;

type FsPath = string;
export interface SettingsVSCode {
    search?: {
        exclude?: ExcludeFilesGlobMap;
    };
}

interface VsCodeSettings {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface ExtSettings {
    uri: string;
    vscodeSettings: SettingsCspell;
    settings: CSpellUserSettings;
    excludeGlobMatcher: GlobMatcher;
    includeGlobMatcher: GlobMatcher;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never;
type GitignoreResultP = ReturnType<GitIgnore['isIgnoredEx']>;
type GitignoreResultInfo = PromiseType<GitignoreResultP>;

export interface ExcludeIncludeIgnoreInfo {
    /** The requested uri */
    uri: string;
    /** The uri used to calculate the response */
    uriUsed: string;
    /** Is included */
    include: boolean;
    /** Is explicitly excluded */
    exclude: boolean;
    /** Ignored by .gitignore */
    ignored: boolean | undefined;
    /** Information related to .gitignore */
    gitignoreInfo: GitignoreResultInfo | undefined;
}

const defaultExclude: Glob[] = [
    '**/*.rendered',
    '__pycache__/**', // ignore cache files. cspell:ignore pycache
];

const defaultAllowedSchemes = ['gist', 'repo', 'file', 'sftp', 'untitled', 'vscode-notebook-cell'];
const schemeBlockList = ['git', 'output', 'debug'];

const defaultRootUri = toFileUri(process.cwd()).toString();

const _defaultSettings: CSpellUserSettings = Object.freeze(Object.create(null));

const defaultCheckOnlyEnabledFileTypes = true;

type ClearFn = () => void;

export class DocumentSettings {
    // Cache per folder settings
    private valuesToClearOnReset: ClearFn[] = [];
    private readonly fetchSettingsForUri = this.createCache((docUri: string | undefined) => this._fetchSettingsForUri(docUri));
    private readonly fetchVSCodeConfiguration = this.createCache((uri?: string) => this._fetchVSCodeConfiguration(uri));
    private readonly fetchRepoRootForDir = this.createCache((dir: FsPath) => findRepoRoot(dir));
    public readonly fetchWorkspaceConfiguration = this.createCache((docUri: DocumentUri) => this._fetchWorkspaceConfiguration(docUri));
    private readonly _folders = this.createLazy(() => this.fetchFolders());
    readonly configsToImport = new Set<string>();
    private readonly importedSettings = this.createLazy(() => this._importSettings());
    private _version = 0;
    private gitIgnore = new GitIgnore();

    constructor(
        readonly connection: Connection,
        readonly api: ServerSideApi,
        readonly defaultSettings: CSpellUserSettings = _defaultSettings,
    ) {}

    async getSettings(document: TextDocumentUri): Promise<CSpellUserSettings> {
        return this.getUriSettings(document.uri);
    }

    getUriSettings(uri: string | undefined): Promise<CSpellUserSettings> {
        return this.fetchUriSettings(uri);
    }

    async calcIncludeExclude(uri: Uri): Promise<ExcludeIncludeIgnoreInfo> {
        const _uri = handleSpecialUri(uri);
        const settings = await this.fetchSettingsForUri(_uri.toString());
        const ie = calcIncludeExclude(settings, _uri);
        const ignoredEx = await this._isGitIgnoredEx(settings, _uri);
        return {
            ...ie,
            ignored: ignoredEx?.matched,
            gitignoreInfo: ignoredEx,
            uri: uri.toString(),
            uriUsed: _uri.toString(),
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

    async resetSettings(): Promise<void> {
        log('resetSettings');
        const waitFor = clearCachedFiles();
        this.valuesToClearOnReset.forEach((fn) => fn());
        this._version += 1;
        this.gitIgnore = new GitIgnore();
        await waitFor;
    }

    get folders(): Promise<WorkspaceFolder[]> {
        return this._folders();
    }

    private _importSettings() {
        log('importSettings');
        const importPaths = [...this.configsToImport].sort();
        return mergeSettings({}, ...readSettingsFiles(importPaths));
    }

    private async _fetchWorkspaceConfiguration(uri: DocumentUri): Promise<WorkspaceConfigForDocument> {
        return this.api.clientRequest.onWorkspaceConfigForDocumentRequest({ uri });
    }

    get version(): number {
        return this._version;
    }

    async registerConfigurationFile(path: string): Promise<void> {
        log('registerConfigurationFile:', path);
        this.configsToImport.add(path);
        this.importedSettings.clear();
        await this.resetSettings();
    }

    private async fetchUriSettings(uri: string | undefined): Promise<CSpellUserSettings> {
        const exSettings = await this.fetchUriSettingsEx(uri);
        return exSettings.settings;
    }

    private fetchUriSettingsEx(uri: string | undefined): Promise<ExtSettings> {
        return this.fetchSettingsForUri(uri);
    }

    private async findMatchingFolder(docUri: string | undefined, defaultTo: WorkspaceFolder): Promise<WorkspaceFolder>;
    private async findMatchingFolder(
        docUri: string | undefined,
        defaultTo?: WorkspaceFolder | undefined,
    ): Promise<WorkspaceFolder | undefined>;
    private async findMatchingFolder(
        docUri: string | undefined,
        defaultTo: WorkspaceFolder | undefined,
    ): Promise<WorkspaceFolder | undefined> {
        return (docUri && (await this.matchingFoldersForUri(docUri))[0]) || defaultTo;
    }

    /**
     * Calculate the schema and domain for the uri;
     * @param docUri
     * @returns
     */
    private rootSchemaAndDomainForUri(docUri: string | Uri | undefined) {
        const uri = Uri.isUri(docUri) ? docUri : Uri.parse(docUri || defaultRootUri);
        return uri.with({ path: '', query: null, fragment: null });
    }

    private rootSchemaAndDomainFolderForUri(docUri: string | Uri | undefined): WorkspaceFolder {
        const root = this.rootSchemaAndDomainForUri(docUri);
        return { uri: root.toString(), name: 'root' };
    }

    private async fetchFolders() {
        const folders = (await getWorkspaceFolders(this.connection)) || [];
        return folders;
    }

    private async _fetchVSCodeConfiguration(uri?: string) {
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

    private async _fetchSettingsForUri(docUri: string | undefined): Promise<ExtSettings> {
        log(`fetchFolderSettings: URI ${docUri}`);
        const uri = (docUri && Uri.parse(docUri)) || undefined;
        const uriSpecial = uri && handleSpecialUri(uri);
        if (uriSpecial && uri !== uriSpecial) {
            return this.fetchSettingsForUri(uriSpecial.toString());
        }
        const folders = await this.folders;
        const useUriForConfig = docUri || folders[0]?.uri || defaultRootUri;
        const searchForUri = Uri.parse(useUriForConfig);
        const searchForFsPath = path.normalize(searchForUri.fsPath);
        const vscodeCSpellConfigSettingsRel = await this.fetchSettingsFromVSCode(docUri);
        const vscodeCSpellConfigSettingsForDocument = await this.resolveWorkspacePaths(vscodeCSpellConfigSettingsRel, useUriForConfig);
        const settings = vscodeCSpellConfigSettingsForDocument.noConfigSearch ? undefined : await searchForConfig(searchForFsPath);
        const rootFolder = this.rootSchemaAndDomainFolderForUri(docUri);
        const folder = await this.findMatchingFolder(docUri, folders[0] || rootFolder);
        const vscodeCSpellSettings = resolveConfigImports(vscodeCSpellConfigSettingsForDocument, folder.uri);
        const globRootFolder = folder !== rootFolder ? folder : folders[0] || folder;

        const mergedSettingsFromVSCode = mergeSettings(this.importedSettings(), vscodeCSpellSettings);
        const mergedSettings = mergeSettings(
            this.defaultSettings,
            filterMergeFields(
                mergedSettingsFromVSCode,
                vscodeCSpellSettings['mergeCSpellSettings'] || !settings,
                vscodeCSpellSettings['mergeCSpellSettingsFields'],
            ),
            settings,
        );

        const enabledFiletypes = extractEnableFiletypes(mergedSettings);
        const spellSettings = applyEnableFiletypes(enabledFiletypes, mergedSettings);
        const fileSettings = calcOverrideSettings(spellSettings, searchForFsPath);
        const { ignorePaths = [], files = [] } = fileSettings;

        const globRoot = Uri.parse(globRootFolder.uri).fsPath;
        if (!files.length && vscodeCSpellConfigSettingsForDocument.spellCheckOnlyWorkspaceFiles !== false) {
            // Add file globs that will match the entire workspace.
            folders.forEach((folder) => files.push({ glob: '/**', root: Uri.parse(folder.uri).fsPath }));
            fileSettings.enableGlobDot = fileSettings.enableGlobDot ?? true;
        }
        fileSettings.files = files;

        const globs = ignorePaths.concat(defaultExclude);
        const excludeGlobMatcher = new GlobMatcher(globs, globRoot);
        const includeOptions: GlobMatchOptions = { root: globRoot, mode: 'include' };
        setIfDefined(includeOptions, 'dot', fileSettings.enableGlobDot);
        const includeGlobMatcher = new GlobMatcher(files, includeOptions);

        const cSpell = vscodeCSpellConfigSettingsForDocument;
        const ext: ExtSettings = {
            uri: useUriForConfig,
            vscodeSettings: { cSpell },
            settings: fileSettings,
            excludeGlobMatcher,
            includeGlobMatcher,
        };
        return ext;
    }

    private async resolveWorkspacePaths(settings: CSpellUserSettings, docUri: string | undefined): Promise<CSpellUserSettings> {
        const folders = await this.folders;
        const folder = (docUri && (await this.findMatchingFolder(docUri))) || folders[0] || this.rootSchemaAndDomainFolderForUri(docUri);
        const resolver = createWorkspaceNamesResolver(folder, folders, settings.workspaceRootPath);
        return resolveSettings(settings, resolver);
    }

    public async matchingFoldersForUri(docUri: string): Promise<WorkspaceFolder[]> {
        const folders = await this.folders;
        return _matchingFoldersForUri(folders, docUri);
    }

    private createCache<K, T>(loader: (key: K) => T): AutoLoadCache<K, T> {
        const cache = createAutoLoadCache(loader);
        this.valuesToClearOnReset.push(() => cache.clear());
        return cache;
    }

    private createLazy<T>(loader: () => T): LazyValue<T> {
        const lazy = createLazyValue(loader);
        this.valuesToClearOnReset.push(() => lazy.clear());
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
    const { import: _import, ...result } = importAbsPath.length
        ? mergeSettings({}, ...readSettingsFiles([...importAbsPath]), config)
        : config;
    return result;
}

function readSettingsFiles(paths: string[]) {
    // log('readSettingsFiles:', paths);
    const existingPaths = paths.filter((filename) => exists(filename));
    log('readSettingsFiles:', existingPaths);
    // console.error('readSettingsFiles: %o', existingPaths);
    return existingPaths.map((file) => cspellReadSettingsFile(file));
}

function exists(file: string): boolean {
    try {
        const s = fs.statSync(file);
        return s.isFile();
    } catch (e) {
        return false;
    }
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
    const mapOfEnabledFileTypes = calcMapOfEnabledFileTypes(enableFiletypes, settings);
    const enabledLanguageIds = [...mapOfEnabledFileTypes.entries()].filter(([_, enabled]) => enabled).map(([lang]) => lang);
    const { enableFiletypes: _, enabledLanguageIds: __, ...rest } = settings;
    return { enabledLanguageIds, mapOfEnabledFileTypes, ...rest };
}

function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
    const ids = enableFiletypes
        .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
        .sort()
        .map((id) => id.replace(/~/g, '!')) // Restore the !
        .map((id) => id.replace(/^(!!)+/, '')); // Remove extra !! pairs

    return ids;
}

function calcMapOfEnabledFileTypes(
    enableFiletypes: string[],
    settings: CSpellUserSettings,
): Required<CSpellUserSettings>['mapOfEnabledFileTypes'] {
    const { enabledLanguageIds = [] } = settings;
    const enabled = new Map<string, boolean>();
    normalizeEnableFiletypes(enabledLanguageIds.concat(enableFiletypes)).forEach((lang) => {
        if (lang[0] === '!') {
            enabled.set(lang.slice(1), false);
        } else {
            enabled.set(lang, true);
        }
    });
    return enabled;
}

export function isLanguageEnabled(languageId: string, settings: CSpellUserSettings): boolean {
    const mapOfEnabledFileTypes = settings.mapOfEnabledFileTypes || calcMapOfEnabledFileTypes(settings.enableFiletypes || [], settings);
    const enabled = mapOfEnabledFileTypes.get(languageId);
    const starEnabled = mapOfEnabledFileTypes.get('*');
    const checkOnly = settings.checkOnlyEnabledFileTypes ?? defaultCheckOnlyEnabledFileTypes;
    return checkOnly && starEnabled !== true ? !!enabled : enabled !== false;
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

    const ex: Iterable<ExcludedByMatch> = pipe(
        getSources(extSettings.settings),
        // keep only leaf sources
        opFilter(keep),
        opFilter(uniqueFilter()),
        opConcatMap((settings) => settings.ignorePaths?.map((glob) => ({ glob, settings })) || []),
    );

    const matches: ExcludedByMatch[] = [...pipe(ex, opFilter(isExcluded))];
    return matches;
}

function extractGlobDef(match: GlobMatchRule): GlobDef {
    return {
        glob: (match.pattern as GlobPatternNormalized).rawGlob || match.pattern.glob || match.glob,
        root: (match.pattern as GlobPatternNormalized).rawRoot || match.pattern.root || match.root,
    };
}

function areGlobsEqual(globA: Glob, globB: Glob): boolean {
    globA = toGlobDef(globA);
    globB = toGlobDef(globB);
    return globA.glob === globB.glob && globA.root?.toUpperCase() === globB.root?.toUpperCase();
}

function toGlobDef(g: Glob): GlobDef {
    return typeof g === 'string' ? { glob: g } : g;
}

export interface CSpellSettingsWithFileSource extends CSpellSettingsWithSourceTrace {
    source: FileSource;
}

function isCSpellSettingsWithFileSource(s: CSpellUserSettings | CSpellSettingsWithFileSource): s is CSpellSettingsWithFileSource {
    return !!(s as CSpellSettingsWithSourceTrace).source?.filename;
}

/**
 * Extract cspell configuration files used as sources to the finalized settings.
 * @param settings - finalized settings
 * @returns config file uri's.
 */
function extractCSpellConfigurationFiles(settings: CSpellUserSettings): Uri[] {
    const configs = extractCSpellFileConfigurations(settings);
    return configs.map(({ source }) => toFileUri(source.filename));
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

    const targetDicts = activeDicts
        .filter(isDictionaryDefinitionPreferred)
        .map(toDictionaryDefinitionCustom)
        .filter((d) => d.addWords)
        .filter((d) => !regExIsOwnedByCspell.test(d.path) && !regExIsOwnedByExtension.test(d.path));
    return targetDicts;
}

function isDictionaryDefinitionCustom(d: DictionaryDefinition): d is DictionaryDefinitionCustom {
    return d.file === undefined && !!d.path && (d as DictionaryDefinitionCustom).addWords !== undefined;
}

function isDictionaryDefinitionPreferred(d: DictionaryDefinition): d is DictionaryDefinitionPreferred {
    return d.file === undefined && !!d.path;
}

function toDictionaryDefinitionCustom(d: DictionaryDefinitionPreferred): DictionaryDefinitionCustom {
    if (isDictionaryDefinitionCustom(d)) return d;
    return {
        ...d,
        addWords: canAddWordsToDictionary(d),
    };
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

export const __testing__ = {
    extractTargetDictionaries,
    extractEnableFiletypes,
    normalizeEnableFiletypes,
    applyEnableFiletypes,
};
