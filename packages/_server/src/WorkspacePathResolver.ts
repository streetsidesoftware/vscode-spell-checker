import {
    BaseSetting,
    DictionaryDefinition
} from 'cspell-lib';
import { CSpellUserSettings, CustomDictionary, CustomDictionaryEntry, defaultDictionaryType } from './cspellConfig';
import { URI as Uri } from 'vscode-uri';
import { logError } from './log';
import { isDefined } from './util';
import * as os from 'os';
import { WorkspaceFolder } from 'vscode-languageserver';

export type WorkspacePathResolverFn = (path: string) => string;

interface WorkspacePathResolver {
    resolveFile: WorkspacePathResolverFn;
    resolveGlob: WorkspacePathResolverFn;
}

interface FolderPath {
    name: string;
    path: string;
}

export function resolveSettings<T extends CSpellUserSettings>(settings: T,
    resolver: WorkspacePathResolver): T {
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
        const values = defs.filter(d => !!d).map(d => d!).map(def => ({ type: defaultDictionaryType, ...def }));
        const byName = new Map(values.map(d => [d.name, d]));
        return [...byName.values()];
    }

    function mapCustomDictionaries(dicts: (CustomDictionary | string)[] = []): DictionaryDefinition[] {
        return mapCustomDictionaryEntries(dicts)
            .map(({ name, path }) => path ? { name, path } : undefined)
            .filter(isDefined);
    }

    // Merge custom dictionaries
    const dictionaryDefinitions: DictionaryDefinition[] = setOptions(([] as (DictionaryDefinition | undefined)[]).concat(
        mapCustomDictionaries(newSettings.customUserDictionaries),
        newSettings.dictionaryDefinitions || [],
        mapCustomDictionaries(newSettings.customWorkspaceDictionaries),
        mapCustomDictionaries(newSettings.customFolderDictionaries)));
    newSettings.dictionaryDefinitions = dictionaryDefinitions.length ? dictionaryDefinitions : undefined;

    // By default all custom dictionaries are enabled
    const names = (a: CustomDictionaryEntry[] | undefined) => a ? a.map(d => typeof d === 'string' ? d : d.name) : [];
    const dictionaries: string[] = ([] as string[]).concat(
        names(newSettings.customUserDictionaries),
        names(newSettings.customWorkspaceDictionaries),
        names(newSettings.customFolderDictionaries),
        newSettings.dictionaries || []);
    newSettings.dictionaries = dictionaries.length ? dictionaries : undefined;

    return shallowCleanObject(newSettings);
}

export function createWorkspaceNamesResolver(folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined): WorkspacePathResolver {
    return {
        resolveFile: createWorkspaceNamesFilePathResolver(folder, folders, root),
        resolveGlob: createWorkspaceNamesGlobPathResolver(folder, folders),
    };
}

function createWorkspaceNamesFilePathResolver(
    folder: WorkspaceFolder,
    folders: WorkspaceFolder[],
    root: string | undefined
): WorkspacePathResolverFn {
    function toFolderPath(w: WorkspaceFolder): FolderPath {
        return {
            name: w.name,
            path: Uri.parse(w.uri).fsPath
        };
    }
    return createWorkspaceNameToPathResolver(
        toFolderPath(folder),
        folders.map(toFolderPath),
        root
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

    return createWorkspaceNameToGlobResolver(
        normalizeToRoot(rootFolder),
        folders.map(toFolderPath).map(normalizeToRoot)
    );
}

function createWorkspaceNameToGlobResolver(folder: FolderPath, folders: FolderPath[]): WorkspacePathResolverFn {
    const folderPairs = [['${workspaceFolder}', folder.path] as [string, string]]
        .concat(folders.map(folder => [`\${workspaceFolder:${ folder.name }}`, folder.path]
        ));
    const map = new Map(folderPairs);
    const regEx = /\$\{workspaceFolder(?:[^}]*)\}/gi;

    function replacer(match: string): string {
        const r = map.get(match);
        if (r !== undefined)
            return r;
        logError(`Failed to resolve ${ match }`);
        return match;
    }

    return (path: string) => {
        return path.replace(regEx, replacer);
    };
}

/**
 *
 * @param currentFolder
 * @param folders
 * @param root
 */
function createWorkspaceNameToPathResolver(
    currentFolder: FolderPath,
    folders: FolderPath[],
    root: string | undefined
): WorkspacePathResolverFn {
    const folderPairs = ([] as [string, string][])
        .concat([
            ['.', currentFolder.path ],
            ['~', os.homedir()],
            ['${workspaceFolder}', root || folders[0]?.path || currentFolder.path],
            ['${root}', root || folders[0]?.path || currentFolder.path],
            ['${workspaceRoot}', root || folders[0]?.path || currentFolder.path],
        ])
        .concat(folders.map(folder => [`\${workspaceFolder:${ folder.name }}`, folder.path]
        ));
    const map = new Map(folderPairs);
    const regEx = /^(?:\.|~|\$\{(?:workspaceFolder|workspaceRoot|root)(?:[^}]*)\})/i;

    function replacer(match: string): string {
        const r = map.get(match);
        if (r)
            return r;
        logError(`Failed to resolve ${ match }`);
        return match;
    }

    return (path: string) => {
        return path.replace(regEx, replacer);
    };
}


function resolveCoreSettings<T extends CSpellUserSettings>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
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
function resolveBaseSettings<T extends BaseSetting>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
    const newSettings = { ...settings };
    newSettings.dictionaryDefinitions = resolveDictionaryPathReferences(newSettings.dictionaryDefinitions, resolver);
    return shallowCleanObject(newSettings);
}
function resolveCustomAndBaseSettings<T extends CSpellUserSettings>(
    settings: T,
    resolver: WorkspacePathResolver
): T {
    const newSettings = resolveBaseSettings(settings, resolver);
    const resolveCustomDicts = (d: CustomDictionaryEntry[] | undefined) => d ? resolveDictionaryPathReferences(mapCustomDictionaryEntries(d), resolver) : undefined;
    newSettings.customUserDictionaries = resolveCustomDicts(newSettings.customUserDictionaries);
    newSettings.customWorkspaceDictionaries = resolveCustomDicts(newSettings.customWorkspaceDictionaries);
    newSettings.customFolderDictionaries = resolveCustomDicts(newSettings.customFolderDictionaries);
    return newSettings;
}
function resolveImportsToWorkspace(
    imports: CSpellUserSettings['import'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['import'] {
    if (!imports)
        return imports;
    const toImport = typeof imports === 'string' ? [imports] : imports;
    return toImport.map(resolver.resolveFile);
}
function resolveGlobArray(globs: string[] | undefined, resolver: WorkspacePathResolverFn): undefined | string[] {
    if (!globs)
        return globs;
    return globs.map(resolver);
}
interface PathRef {
    path?: string | undefined;
}
function resolveDictionaryPathReferences<T extends PathRef>(
    dictDefs: T[] | undefined,
    resolver: WorkspacePathResolver
): T[] | undefined {
    if (!dictDefs)
        return dictDefs;

    return dictDefs
        .map(def => def.path ? { ...def, path: resolver.resolveFile(def.path) } : def);
}
function resolveLanguageSettings(
    langSettings: CSpellUserSettings['languageSettings'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['languageSettings'] {
    if (!langSettings)
        return langSettings;

    return langSettings.map(langSetting => {
        return shallowCleanObject({ ...resolveBaseSettings(langSetting, resolver) });
    });
}
function resolveOverrides(
    overrides: CSpellUserSettings['overrides'],
    resolver: WorkspacePathResolver
): CSpellUserSettings['overrides'] {
    if (!overrides)
        return overrides;

    function resolve(path: string | string[]) {
        if (!path)
            return path;
        return typeof path === 'string' ? resolver.resolveFile(path) : path.map(resolver.resolveFile);
    }

    return overrides.map(src => {
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

function mapCustomDictionaryEntry(d: CustomDictionaryEntry): CustomDictionary {
    if (typeof d == 'string') {
        return { name: d, addWords: true };
    }

    return d;
}

function mapCustomDictionaryEntries(entries: CustomDictionaryEntry[]): CustomDictionary[] {
    return entries.map(mapCustomDictionaryEntry);
}

export const debugExports = {
    shallowCleanObject
};
