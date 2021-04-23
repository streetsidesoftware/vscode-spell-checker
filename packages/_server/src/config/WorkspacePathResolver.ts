import { BaseSetting, DictionaryDefinition, Glob, GlobDef } from 'cspell-lib';
import {
    CSpellUserSettings,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
    CustomDictionaryWithScope,
} from '../config/cspellConfig';
import { URI as Uri } from 'vscode-uri';
import { logError } from '../utils/log';
import { isDefined } from '../utils';
import * as os from 'os';
import { WorkspaceFolder } from 'vscode-languageserver/node';
import * as Path from 'path';

export type WorkspaceGlobResolverFn = (glob: Glob) => GlobDef;
export type WorkspacePathResolverFn = (path: string) => string;

interface WorkspacePathResolver {
    resolveFile: WorkspacePathResolverFn;
    resolveGlob: WorkspaceGlobResolverFn;
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
    newSettings.overrides = resolveOverrides(newSettings.overrides, resolver);

    function setOptions(defs: (DictionaryDefinition | undefined)[]): DictionaryDefinition[] {
        const values = defs.filter(isDefined);
        const byName = new Map(values.map((d) => [d.name, d]));
        return [...byName.values()];
    }

    function mapCustomDictionaries(dicts: (CustomDictionary | string)[] = [], scope: CustomDictionaryScope): DictionaryDefinitionCustom[] {
        return mapCustomDictionaryEntries(dicts, scope)
            .map(({ name, path, scope, addWords }) => (path ? { name, path, scope, addWords: addWords || false } : undefined))
            .filter(isDefined);
    }

    // Merge custom dictionaries
    const dictionaryDefinitions: DictionaryDefinition[] = setOptions(
        ([] as (DictionaryDefinition | undefined)[]).concat(
            mapCustomDictionaries(newSettings.customUserDictionaries, 'user'),
            newSettings.dictionaryDefinitions || [],
            mapCustomDictionaries(newSettings.customWorkspaceDictionaries, 'workspace'),
            mapCustomDictionaries(newSettings.customFolderDictionaries, 'folder')
        )
    );
    newSettings.dictionaryDefinitions = dictionaryDefinitions.length ? dictionaryDefinitions : undefined;

    // By default all custom dictionaries are enabled
    const names = (a: CustomDictionaryEntry[] | undefined) => (a ? a.map((d) => (typeof d === 'string' ? d : d.name)) : []);
    const dictionaries: string[] = ([] as string[]).concat(
        names(newSettings.customUserDictionaries),
        names(newSettings.customWorkspaceDictionaries),
        names(newSettings.customFolderDictionaries),
        newSettings.dictionaries || []
    );
    newSettings.dictionaries = dictionaries.length ? dictionaries : undefined;

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
    root: string | undefined
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
        path: uri.fsPath,
        uri: uri,
    };
}

function createWorkspaceNamesFilePathResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined
): WorkspacePathResolverFn {
    return createWorkspaceNameToPathResolver(toFolderPath(folder), folders.map(toFolderPath), root);
}

function createWorkspaceNamesGlobPathResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined
): WorkspaceGlobResolverFn {
    const rootFolder = toFolderPath(folder);

    return createWorkspaceNameToGlobResolver(rootFolder, folders.map(toFolderPath), root);
}

function createWorkspaceNameToGlobResolver(folder: FolderPath, folders: FolderPath[], root: string | undefined): WorkspaceGlobResolverFn {
    const folderPairs = [['${workspaceFolder}', folder.path] as [string, string]].concat(
        folders.map((folder) => [`\${workspaceFolder:${folder.name}}`, folder.path])
    );
    const map = new Map(folderPairs);
    const regEx = /^\$\{workspaceFolder(?:[^}]*)\}/i;

    function lookUpWorkspaceFolder(match: string): string {
        const r = map.get(match);
        if (r !== undefined) return r;
        logError(`Failed to resolve ${match}`);
        return match;
    }

    return (glob: Glob) => {
        if (typeof glob == 'string') {
            glob = {
                glob,
                root,
            };
        }

        const matchGlob = glob.glob.match(regEx);
        if (matchGlob) {
            const root = lookUpWorkspaceFolder(matchGlob[0]);
            return {
                ...glob,
                glob: glob.glob.slice(matchGlob[0].length),
                root,
            };
        }

        const matchRoot = glob.root?.match(regEx);
        if (matchRoot && glob.root) {
            const root = lookUpWorkspaceFolder(matchRoot[0]);
            return {
                ...glob,
                glob: glob.glob,
                root: Path.join(root, glob.root.slice(matchRoot[0].length)),
            };
        }

        return glob;
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
    root: string | undefined
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
    newSettings.ignorePaths = resolveGlobArray(newSettings.ignorePaths, resolver.resolveGlob);
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
    const resolveCustomDicts = (d: CustomDictionaryEntry[] | undefined, scope: CustomDictionaryScope) =>
        d ? resolveDictionaryPathReferences(mapCustomDictionaryEntries(d, scope), resolver) : undefined;
    newSettings.customUserDictionaries = resolveCustomDicts(newSettings.customUserDictionaries, 'user');
    newSettings.customWorkspaceDictionaries = resolveCustomDicts(newSettings.customWorkspaceDictionaries, 'workspace');
    newSettings.customFolderDictionaries = resolveCustomDicts(newSettings.customFolderDictionaries, 'folder');
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
function resolveDictionaryPathReferences<T extends PathRef>(dictDefs: T[] | undefined, resolver: WorkspacePathResolver): T[] | undefined {
    if (!dictDefs) return dictDefs;

    return dictDefs.map((def) => (def.path ? { ...def, path: resolver.resolveFile(def.path) } : def));
}
function resolveLanguageSettings(
    langSettings: CSpellUserSettings['languageSettings'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['languageSettings'] {
    if (!langSettings) return langSettings;

    return langSettings.map((langSetting) => {
        return shallowCleanObject({ ...resolveBaseSettings(langSetting, resolver) });
    });
}
function resolveOverrides(overrides: CSpellUserSettings['overrides'], resolver: WorkspacePathResolver): CSpellUserSettings['overrides'] {
    if (!overrides) return overrides;

    function resolve(glob: Glob | Glob[]) {
        if (!glob) return glob;
        return Array.isArray(glob) ? glob.map(resolver.resolveGlob) : resolver.resolveGlob(glob);
    }

    return overrides.map((src) => {
        const dest = { ...resolveCoreSettings(src, resolver) };
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

function mapCustomDictionaryEntry(d: CustomDictionaryEntry, scope: CustomDictionaryScope): CustomDictionaryWithScope {
    if (typeof d == 'string') {
        return { name: d, addWords: true, scope };
    }

    return { ...d, scope };
}

function mapCustomDictionaryEntries(entries: CustomDictionaryEntry[], scope: CustomDictionaryScope): CustomDictionaryWithScope[] {
    return entries.map((d) => mapCustomDictionaryEntry(d, scope));
}

export const debugExports = {
    shallowCleanObject,
};
