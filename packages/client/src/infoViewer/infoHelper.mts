import { uriToName } from '@internal/common-utils/uriHelper';
import type { EnabledFileTypes } from 'code-spell-checker-server/lib';
import { extractEnabledFileTypes } from 'code-spell-checker-server/lib';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import type {
    Config,
    ConfigFile,
    Configs,
    ConfigSource,
    DictionaryEntry,
    FileConfig,
    FileTypeList,
    Settings,
    TextDocument,
    Workspace,
    WorkspaceFolder,
} from 'webview-api';

import type {
    ConfigTarget,
    ConfigTargetCSpell,
    CSpellClient,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    GetConfigurationForDocumentResult,
    PartialCSpellUserSettings,
} from '../client/index.mjs';
import type { Inspect, InspectValues } from '../settings/index.mjs';
import { ConfigFields, inspectConfig } from '../settings/index.mjs';
import type { Maybe } from '../util/index.mjs';
import { isDefined, uniqueFilter } from '../util/index.mjs';
import { defaultTo, map, pipe } from '../util/pipe.js';
import { toUri } from '../util/uriHelper.mjs';

type ConfigFields =
    | typeof ConfigFields.dictionaryDefinitions
    | typeof ConfigFields.dictionaries
    | typeof ConfigFields.languageSettings
    | typeof ConfigFields.language
    | typeof ConfigFields.enabledLanguageIds
    | typeof ConfigFields.enabledFileTypes
    | typeof ConfigFields.enableFiletypes;

type SelectedCSpellUserSettings = PartialCSpellUserSettings<ConfigFields>;

type Logger = typeof console.log;

export async function calcSettings(
    document: Maybe<vscode.TextDocument>,
    folderUri: Maybe<Uri>,
    client: CSpellClient,
    log: Logger,
): Promise<Settings> {
    const activeFolderUri = folderUri || getDefaultWorkspaceFolderUri(document?.uri);
    const config = inspectConfig(activeFolderUri);
    const docConfig = await client.getConfigurationForDocument<ConfigFields>(document, {
        enabledFileTypes: true,
        enabledLanguageIds: true,
        enableFiletypes: true,
        dictionaries: true,
        dictionaryDefinitions: true,
        languageSettings: true,
        language: true,
    });
    const settings: Settings = {
        knownLanguageIds: [...client.languageIds].sort(),
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig, document, log),
        workspace: mapWorkspace(client.allowedSchemas, vscode.workspace),
        activeFileUri: document?.uri.toString(),
        activeFolderUri: activeFolderUri?.toString(),
    };

    // console.log('settings: %o', {
    //     ...pickFields(settings, ['activeFileUri', 'activeFolderUri']),
    //     ...pickFields(settings.configs.file, ['fileName', 'name', 'isUntitled', 'languageIdEnabled']),
    //     ...pickFields(docConfig.docSettings, ['enabledFileTypes']),
    // });
    return settings;
}

type InspectKeys = keyof InspectValues<SelectedCSpellUserSettings>;
const keyMap: { [k in InspectKeys]: ConfigSource } = {
    defaultValue: 'default',
    globalValue: 'user',
    workspaceValue: 'workspace',
    workspaceFolderValue: 'folder',
};

interface ConfigOrder {
    0: 'defaultValue';
    1: 'globalValue';
    2: 'workspaceValue';
    3: 'workspaceFolderValue';
}

interface ConfigOrderArray extends ConfigOrder {
    map<U>(callbackfn: (v: InspectKeys, i: number) => U): U[];
}
const configOrder: ConfigOrderArray = ['defaultValue', 'globalValue', 'workspaceValue', 'workspaceFolderValue'];
const configOrderRev = new Map(configOrder.map((v, i) => [v, i]));

function extractViewerConfigFromConfig(
    config: Inspect<SelectedCSpellUserSettings>,
    docConfig: GetConfigurationForDocumentResult<ConfigFields>,
    doc: vscode.TextDocument | undefined,
    log: Logger,
): Configs {
    return {
        user: extractNearestConfig(1, config),
        workspace: extractNearestConfig(2, config),
        folder: extractNearestConfig(3, config),
        file: extractFileConfig(docConfig, doc, log),
    };
}

function inspectKeyToOrder(a: InspectKeys): number {
    return configOrderRev.get(a) || 0;
}

function mergeSource(a: InspectKeys, b: InspectKeys): InspectKeys {
    return inspectKeyToOrder(a) > inspectKeyToOrder(b) ? a : b;
}

function findNearestConfigField<K extends keyof SelectedCSpellUserSettings>(
    orderPos: keyof ConfigOrder,
    key: K,
    config: Inspect<SelectedCSpellUserSettings>,
): InspectKeys {
    for (let i = orderPos; i > 0; --i) {
        const inspectKey = configOrder[i];
        const setting = config[inspectKey];
        if (setting && setting[key]) {
            return inspectKey;
        }
    }
    return 'defaultValue';
}

function extractNearestConfig(orderPos: keyof ConfigOrder, config: Inspect<SelectedCSpellUserSettings>): Config {
    const localeSource = findNearestConfigField(orderPos, 'language', config);
    const languageIdsEnabledSource = findNearestConfigField(orderPos, ConfigFields.enabledLanguageIds, config);
    const enableFiletypesSource = findNearestConfigField(orderPos, ConfigFields.enableFiletypes, config);
    const enabledFileTypesSource = findNearestConfigField(orderPos, ConfigFields.enabledFileTypes, config);
    const languageIdsEnabled = extractEnabledLanguageIds(
        config[languageIdsEnabledSource],
        config[enableFiletypesSource],
        config[enabledFileTypesSource],
    );
    const langSource = mergeSource(languageIdsEnabledSource, enableFiletypesSource);

    const cfg: Config = {
        inherited: { locales: keyMap[localeSource], languageIdsEnabled: keyMap[langSource] },
        locales: normalizeLocales(config[localeSource]?.language),
        languageIdsEnabled,
    };
    return cfg;
}

function mapExcludedBy(refs: GetConfigurationForDocumentResult<ConfigFields>['excludedBy']): FileConfig['excludedBy'] {
    if (!refs) return undefined;

    return refs.map((r) => ({
        ...r,
        name: r.name || (r.configUri && uriToName(toUri(r.configUri))),
    }));
}

function extractFileConfig(
    docConfig: GetConfigurationForDocumentResult<ConfigFields>,
    doc: vscode.TextDocument | undefined,
    _log: Logger,
): FileConfig | undefined {
    if (!doc) return undefined;
    const { uri, fileName, languageId, isUntitled } = doc;
    const {
        enabled,
        enabledVSCode,
        languageIdEnabled,
        docSettings,
        fileEnabled,
        fileIsExcluded,
        fileIsIncluded,
        gitignoreInfo,
        excludedBy,
        uriUsed,
        workspaceFolderUri,
    } = docConfig;
    const enabledDicts = new Set<string>((docSettings && docSettings.dictionaries) || []);
    const dictionaries = extractDictionariesFromConfig(docSettings).filter((dic) => enabledDicts.has(dic.name));
    // _log(`extractFileConfig languageIdEnabled: ${languageIdEnabled ? 'true' : 'false'}`);

    const uriToUse = uriUsed ? Uri.parse(uriUsed) : uri;
    const folder =
        (workspaceFolderUri && vscode.workspace.getWorkspaceFolder(Uri.parse(workspaceFolderUri))) ||
        vscode.workspace.getWorkspaceFolder(uriToUse);

    function extractGitignoreInfo(): FileConfig['gitignoreInfo'] {
        if (!gitignoreInfo) return undefined;
        const { glob, gitIgnoreFile, line, matched, root } = gitignoreInfo;
        const uri = Uri.file(gitIgnoreFile);
        return {
            matched,
            glob,
            line,
            root,
            gitignoreFileUri: uri.toString(),
            gitignoreName: uriToName(uri),
        };
    }

    const cfg: FileConfig = {
        enabled,
        enabledVSCode,
        uri: uri.toString(),
        uriActual: uriToUse.toString(),
        fileName,
        name: uriToUse.path.split('/').slice(-1)[0],
        isUntitled,
        locales: normalizeLocales(docSettings?.language),
        languageId,
        dictionaries,
        languageIdEnabled: languageIdEnabled,
        fileEnabled,
        configFiles: extractConfigFiles(docConfig),
        fileIsExcluded,
        fileIsIncluded,
        fileIsInWorkspace: !!folder || !!workspaceFolderUri || isUntitled,
        excludedBy: mapExcludedBy(excludedBy),
        gitignoreInfo: extractGitignoreInfo(),
        blockedReason: docConfig.blockedReason,
        workspaceFolder: folderInfo(folder),
    };
    return cfg;
}

function folderInfo(folder: vscode.WorkspaceFolder | undefined): WorkspaceFolder | undefined {
    if (!folder) return undefined;

    return {
        uri: folder.uri.toString(),
        name: folder.name,
        index: folder.index,
    };
}

function getDefaultWorkspaceFolder() {
    return vscode.workspace.workspaceFolders?.[0];
}

function getDefaultWorkspaceFolderUri(docUri?: Uri) {
    const docFolder = docUri && vscode.workspace.getWorkspaceFolder(docUri)?.uri;
    return docFolder || getDefaultWorkspaceFolder()?.uri;
}

function normalizeFilenameToFriendlyName(filename: string | Uri): string {
    return vscode.workspace.asRelativePath(filename, true);
}

function normalizeUriToFriendlyName(uri: Uri): string {
    return uri.scheme === 'file' || vscode.workspace.getWorkspaceFolder(uri)
        ? vscode.workspace.asRelativePath(uri, true)
        : uri.toString(true);
}

interface ExtractConfigFilesRequest {
    configFiles: string[];
    configTargets: ConfigTarget[];
}

function extractConfigFiles(docConfig: ExtractConfigFilesRequest): ConfigFile[] {
    const { configFiles, configTargets } = docConfig;
    const t: ConfigFile[] = configTargets.filter(isConfigTargetCSpell).map(({ name, configUri: uri }) => ({ name, uri }));
    if (t.length) return t;
    const c: ConfigFile[] = configFiles.map((uri) => ({
        name: uriToName(toUri(uri)),
        uri,
    }));
    return c;
}

function isConfigTargetCSpell(t: ConfigTarget): t is ConfigTargetCSpell {
    return t.kind === 'cspell';
}

const regIsTextFile = /\.txt$/;
const regIsCspellDict = /(?:@|%40)cspell\//;

function extractDictionariesFromConfig(config: PartialCSpellUserSettings<ConfigFields> | undefined): DictionaryEntry[] {
    if (!config) {
        return [];
    }

    const dictionaries = config.dictionaryDefinitions || [];
    const dictionariesByName = new Map(dictionaries.map(mapDict).map((e) => [e.name, e] as [string, DictionaryEntry]));
    const languageSettings = config.languageSettings || [];
    languageSettings.forEach((setting) => {
        const locales = normalizeLocales(setting.locale || setting.local);
        const languageIds = normalizeId(setting.languageId);
        const dicts = setting.dictionaries || [];
        dicts.forEach((dict) => {
            const dictEntry = dictionariesByName.get(dict);
            if (dictEntry) {
                dictEntry.locales = merge(dictEntry.locales, locales);
                dictEntry.languageIds = merge(dictEntry.languageIds, languageIds);
            }
        });
    });
    return [...dictionariesByName.values()];
}

function mapDict(def: DictionaryDefinition): DictionaryEntry {
    const dictUri = getDictUri(def);
    const dictUriStr = dictUri?.toString();
    const isCustomDict =
        dictUriStr &&
        ((def as DictionaryDefinitionCustom).addWords || (regIsTextFile.test(dictUriStr) && !regIsCspellDict.test(dictUriStr)));

    return {
        name: def.name,
        locales: [],
        languageIds: [],
        description: def.description,
        uri: isCustomDict ? dictUriStr : undefined,
        uriName: isCustomDict && dictUri ? normalizeUriToFriendlyName(dictUri) : undefined,
    };
}

function getDictUri(def: DictionaryDefinition): vscode.Uri | undefined {
    if (!def.path && !def.file) return undefined;
    return Uri.joinPath(toUri(def.path || ''), def.file || '');
}

function normalizeLocales(locale: string | string[] | undefined): string[] {
    return normalizeId(locale);
}

function normalizeId(locale: string | string[] | undefined): string[] {
    return pipe(
        locale,
        map((locale) => (typeof locale === 'string' ? locale : locale.join(','))),
        map((locale) =>
            locale
                .replace(/\*/g, '')
                .split(/[,;]/)
                .map((a) => a.trim())
                .filter((a) => !!a),
        ),
        defaultTo([] as string[]),
    );
}

function merge(left: string[], right: string[]): string[] {
    return left.concat(right).filter(uniqueFilter());
}

interface VSCodeWorkspace {
    name: string | undefined;
    workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined;
    textDocuments: readonly vscode.TextDocument[];
}

function mapWorkspace(allowedSchemas: Set<string>, vsWorkspace: VSCodeWorkspace): Workspace {
    function mapWorkspaceFolder(wsf: vscode.WorkspaceFolder): WorkspaceFolder {
        const { name, index } = wsf;
        return {
            uri: wsf.uri.toString(),
            name,
            index,
        };
    }

    function mapTextDocuments(td: vscode.TextDocument): TextDocument {
        const { fileName, languageId, isUntitled } = td;
        return {
            uri: td.uri.toString(),
            fileName: normalizeFilenameToFriendlyName(fileName),
            languageId,
            isUntitled,
        };
    }

    const { name, workspaceFolders, textDocuments } = vsWorkspace;
    const workspace: Workspace = {
        name,
        workspaceFolders: workspaceFolders ? workspaceFolders.map(mapWorkspaceFolder) : undefined,
        textDocuments: textDocuments.filter((td) => allowedSchemas.has(td.uri.scheme)).map(mapTextDocuments),
    };

    return workspace;
}

function calcEnabledFileTypes(...settings: SelectedCSpellUserSettings[]): EnabledFileTypes {
    const enabled: EnabledFileTypes = {};

    return settings.reduce((acc, s) => extractEnabledFileTypes(s, acc), enabled);
}

function extractEnabledLanguageIds(...settings: (SelectedCSpellUserSettings | undefined)[]): FileTypeList {
    const enabled = calcEnabledFileTypes(...settings.filter(isDefined));
    return Object.entries(enabled)
        .filter(([, v]) => v)
        .map(([k]) => k);
}

export const __testing__ = {
    extractConfigFiles,
    extractEnabledLanguageIds,
    extractDictionariesFromConfig,
    extractViewerConfigFromConfig,
    mapWorkspace,
    normalizeLocales,
};
