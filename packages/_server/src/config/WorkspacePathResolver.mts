import { logError } from '@internal/common-utils/log';
import { uriToFilePathOrHref } from '@internal/common-utils/uriHelper';
import type { BaseSetting, Glob, GlobDef } from 'cspell-lib';
import * as os from 'os';
import type { WorkspaceFolder } from 'vscode-languageserver/node.js';
import { URI as Uri } from 'vscode-uri';

import type { CSpellUserSettings } from './cspellConfig/index.mjs';
import { extractDictionaryDefinitions, extractDictionaryList } from './customDictionaries.mjs';
import { toDirURL } from './urlUtil.mjs';

export type WorkspaceGlobResolverFn = (glob: Glob) => GlobDef;
export type WorkspacePathResolverFn = (path: string) => string;

interface WorkspacePathResolver {
    resolveFile: WorkspacePathResolverFn;
    resolveGlob: (globRoot: string | undefined) => WorkspaceGlobResolverFn;
}

interface FolderPath {
    name: string;
    path: string;
    uri: Uri;
}

export function resolveSettings<T extends CSpellUserSettings>(settings: T, resolver: WorkspacePathResolver): T {
    // Sections
    // - imports
    // - dictionary definitions (also nested in language settings)
    // - globs (ignorePaths and Override filenames)
    // - override dictionaries
    // - custom dictionaries
    // There is a more elegant way of doing this, but for now just change each section.
    const newSettings = resolveCoreSettings(settings, resolver);
    newSettings.import = resolveImportsToWorkspace(newSettings.import, resolver);
    newSettings.overrides = resolveOverrides(newSettings, resolver);

    // Merge custom dictionaries
    const dictionaryDefinitions = resolveDictionaryPathReferences(extractDictionaryDefinitions(newSettings), resolver);
    newSettings.dictionaryDefinitions = dictionaryDefinitions.length ? dictionaryDefinitions : undefined;

    // By default all custom dictionaries are enabled
    const dictionaries = extractDictionaryList(newSettings);

    newSettings.dictionaries = dictionaries.length ? dictionaries : undefined;

    // Remove unwanted settings.
    delete newSettings.customUserDictionaries;
    delete newSettings.customWorkspaceDictionaries;
    delete newSettings.customFolderDictionaries;

    return shallowCleanObject(newSettings);
}

/**
 *
 * @param folder - Workspace folder to be considered the active folder
 * @param folders - all folders including the active folder
 * @param root - optional file path
 */
export function createWorkspaceNamesResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined,
): WorkspacePathResolver {
    return {
        resolveFile: createWorkspaceNamesFilePathResolver(folder, folders, root),
        resolveGlob: createWorkspaceNamesGlobPathResolver(folder, folders, root),
    };
}

function toFolderPath(w: WorkspaceFolder): FolderPath {
    const uri = Uri.parse(w.uri);
    return {
        name: w.name,
        path: uriToFilePathOrHref(uri),
        uri: uri,
    };
}

function createWorkspaceNamesFilePathResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined,
): WorkspacePathResolverFn {
    return createWorkspaceNameToPathResolver(toFolderPath(folder), folders.map(toFolderPath), root);
}

function createWorkspaceNamesGlobPathResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined,
): (globRoot: string | undefined) => WorkspaceGlobResolverFn {
    const rootFolder = toFolderPath(folder);

    return createWorkspaceNameToGlobResolver(rootFolder, folders.map(toFolderPath), root);
}

function createWorkspaceNameToGlobResolver(
    folder: FolderPath,
    folders: FolderPath[],
    workspaceRoot: string | undefined,
): (globRoot: string | undefined) => WorkspaceGlobResolverFn {
    const _folder = { ...folder };
    const _folders = [...folders];
    return (globRoot: string | URL | undefined) => {
        const folderPairs = [['${workspaceFolder}', toDirURL(_folder.path)] as [string, URL]].concat(
            _folders.map((folder) => [`\${workspaceFolder:${folder.name}}`, toDirURL(folder.path)]),
        );
        workspaceRoot = workspaceRoot || _folder.path;
        const map = new Map(folderPairs);
        const regEx = /^\$\{workspaceFolder(?:[^}]*)\}/i;
        const root = resolveRoot(globRoot || '${workspaceFolder}');

        function lookUpWorkspaceFolder(match: string): URL {
            const r = map.get(match);
            if (r !== undefined) return r;
            logError(`Failed to resolve ${match}`);
            return toDirURL(match);
        }

        function resolveRoot(globRoot: string | URL | undefined): URL | undefined {
            if (globRoot instanceof URL) return globRoot;
            globRoot = globRoot?.startsWith('~') ? os.homedir() + globRoot.slice(1) : globRoot;
            const matchRoot = globRoot?.match(regEx);
            if (matchRoot && globRoot) {
                const workspaceRoot = lookUpWorkspaceFolder(matchRoot[0]);
                let path = globRoot.slice(matchRoot[0].length).replace('\\', '/');
                path = path.startsWith('/') ? path.slice(1) : path;
                // console.log('matchRoot: %o', { globRoot, matchRoot, path, workspaceRoot: workspaceRoot.href });
                return new URL(path, workspaceRoot);
            }
            return globRoot ? toDirURL(globRoot) : undefined;
        }

        function resolver(glob: Glob) {
            if (typeof glob == 'string') {
                glob = {
                    glob,
                    root: root?.href,
                };
            }

            const matchGlob = glob.glob.match(regEx);
            if (matchGlob) {
                const root = lookUpWorkspaceFolder(matchGlob[0]);
                return {
                    ...glob,
                    glob: glob.glob.slice(matchGlob[0].length),
                    root: root.href,
                };
            }

            return {
                ...glob,
                root: resolveRoot(glob.root)?.href,
            };
        }

        return (glob: Glob) => {
            const r = resolver(glob);
            // console.log('resolveGlob: %o -> %o', glob, r);
            return r;
        };
    };
}

/**
 *
 * @param currentFolder
 * @param folders
 * @param root - optional file path to consider the root
 */
function createWorkspaceNameToPathResolver(
    currentFolder: FolderPath,
    folders: FolderPath[],
    root: string | undefined,
): WorkspacePathResolverFn {
    const folderPairs = ([] as [string, string][])
        .concat([
            ['.', currentFolder.path],
            ['~', os.homedir()],
            ['${workspaceFolder}', currentFolder.path],
            ['${root}', root || folders[0]?.path || currentFolder.path],
            ['${workspaceRoot}', root || folders[0]?.path || currentFolder.path],
        ])
        .concat(folders.map((folder) => [`\${workspaceFolder:${folder.name}}`, folder.path]));
    const map = new Map(folderPairs);
    const regEx = /^(?:\.|~|\$\{(?:workspaceFolder|workspaceRoot|root)(?:[^}]*)\})/i;

    function replacer(match: string): string {
        const r = map.get(match);
        if (r) return r;
        logError(`Failed to resolve ${match}`);
        return match;
    }

    return (path: string): string => {
        return path.replace(regEx, replacer);
    };
}

function resolveCoreSettings<T extends CSpellUserSettings>(settings: T, resolver: WorkspacePathResolver): T {
    // Sections
    // - imports
    // - dictionary definitions (also nested in language settings)
    // - globs (ignorePaths and Override filenames)
    // - override dictionaries
    const newSettings: CSpellUserSettings = resolveCustomAndBaseSettings(settings, resolver);
    // There is a more elegant way of doing this, but for now just change each section.
    newSettings.dictionaryDefinitions = resolveDictionaryPathReferences(newSettings.dictionaryDefinitions, resolver);
    newSettings.languageSettings = resolveLanguageSettings(newSettings.languageSettings, resolver);
    newSettings.ignorePaths = resolveGlobArray(newSettings.ignorePaths, resolver.resolveGlob(newSettings.globRoot));
    newSettings.files = resolveGlobArray(newSettings.files, resolver.resolveGlob(newSettings.globRoot));
    newSettings.workspaceRootPath = newSettings.workspaceRootPath ? resolver.resolveFile(newSettings.workspaceRootPath) : undefined;
    return shallowCleanObject(newSettings) as T;
}
function resolveBaseSettings<T extends BaseSetting>(settings: T, resolver: WorkspacePathResolver): T {
    const newSettings = { ...settings };
    newSettings.dictionaryDefinitions = resolveDictionaryPathReferences(newSettings.dictionaryDefinitions, resolver);
    return shallowCleanObject(newSettings);
}
function resolveCustomAndBaseSettings<T extends CSpellUserSettings>(settings: T, resolver: WorkspacePathResolver): T {
    const newSettings = resolveBaseSettings(settings, resolver);
    return newSettings;
}
function resolveImportsToWorkspace(imports: CSpellUserSettings['import'], resolver: WorkspacePathResolver): CSpellUserSettings['import'] {
    if (!imports) return imports;
    const toImport = typeof imports === 'string' ? [imports] : imports;
    return toImport.map(resolver.resolveFile);
}
function resolveGlobArray(globs: Glob[] | undefined, resolver: WorkspaceGlobResolverFn): undefined | Glob[] {
    if (!globs) return globs;
    return globs.map(resolver);
}
interface PathRef {
    path?: string | undefined;
}

function resolveDictionaryPathReferences<T extends PathRef>(dictDefs: T[], resolver: WorkspacePathResolver): T[];
function resolveDictionaryPathReferences<T extends PathRef>(dictDefs: T[] | undefined, resolver: WorkspacePathResolver): T[] | undefined;
function resolveDictionaryPathReferences<T extends PathRef>(dictDefs: T[] | undefined, resolver: WorkspacePathResolver): T[] | undefined {
    if (!dictDefs) return dictDefs;

    return dictDefs.map((def) => (def.path ? { ...def, path: resolver.resolveFile(def.path) } : def));
}
function resolveLanguageSettings(
    langSettings: CSpellUserSettings['languageSettings'],
    resolver: WorkspacePathResolver,
): CSpellUserSettings['languageSettings'] {
    if (!langSettings) return langSettings;

    return langSettings.map((langSetting) => {
        return shallowCleanObject({ ...resolveBaseSettings(langSetting, resolver) });
    });
}
function resolveOverrides(settings: CSpellUserSettings, resolver: WorkspacePathResolver): CSpellUserSettings['overrides'] {
    const { overrides } = settings;
    if (!overrides) return overrides;

    const resolveGlob = resolver.resolveGlob(settings.globRoot);

    function resolve(glob: Glob | Glob[]) {
        if (!glob) return glob;
        return Array.isArray(glob) ? glob.map(resolveGlob) : resolveGlob(glob);
    }

    return overrides.map((src) => {
        const dest = { ...resolveCoreSettings(src, resolver) };
        dest.filename = resolve(dest.filename);

        return shallowCleanObject(dest);
    });
}

function shallowCleanObject<T>(obj: T): T {
    if (typeof obj !== 'object') return obj;
    const objMap = obj as Record<string, unknown>;
    for (const key of Object.keys(objMap)) {
        if (objMap[key] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete objMap[key];
        }
    }
    return obj;
}

export const debugExports = {
    shallowCleanObject,
};
