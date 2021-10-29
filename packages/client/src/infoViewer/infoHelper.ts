import { uriToName } from 'common-utils/uriHelper';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import {
    Config,
    ConfigFile,
    Configs,
    ConfigSource,
    DictionaryEntry,
    FileConfig,
    Settings,
    TextDocument,
    Workspace,
    WorkspaceFolder,
} from '../../settingsViewer/api/settings';
import type {
    ConfigTarget,
    ConfigTargetCSpell,
    CSpellUserSettings,
    DictionaryDefinition,
    GetConfigurationForDocumentResult,
} from '../client';
import { CSpellClient } from '../client';
import { Inspect, inspectConfig, InspectValues } from '../settings';
import { Maybe, uniqueFilter } from '../util';
import { defaultTo, map, pipe } from '../util/pipe';
import { toUri } from '../util/uriHelper';

type Logger = typeof console.log;

export async function calcSettings(
    document: Maybe<vscode.TextDocument>,
    folderUri: Maybe<Uri>,
    client: CSpellClient,
    log: Logger
): Promise<Settings> {
    const activeFolderUri = folderUri || getDefaultWorkspaceFolderUri();
    const config = inspectConfig(activeFolderUri);
    const docConfig = await client.getConfigurationForDocument(document);
    const settings: Settings = {
        knownLanguageIds: [...client.languageIds].sort(),
        dictionaries: extractDictionariesFromConfig(docConfig.settings),
        configs: extractViewerConfigFromConfig(config, docConfig, document, log),
        workspace: mapWorkspace(client.allowedSchemas, vscode.workspace),
        activeFileUri: document && document.uri.toString(),
        activeFolderUri: activeFolderUri?.toString(),
    };
    return settings;
}

type InspectKeys = keyof InspectValues<CSpellUserSettings>;
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
    config: Inspect<CSpellUserSettings>,
    docConfig: GetConfigurationForDocumentResult,
    doc: vscode.TextDocument | undefined,
    log: Logger
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

function findNearestConfigField<K extends keyof CSpellUserSettings>(
    orderPos: keyof ConfigOrder,
    key: K,
    config: Inspect<CSpellUserSettings>
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

function extractNearestConfig(orderPos: keyof ConfigOrder, config: Inspect<CSpellUserSettings>): Config {
    const localeSource = findNearestConfigField(orderPos, 'language', config);
    const languageIdsEnabledSource = findNearestConfigField(orderPos, 'enabledLanguageIds', config);
    const enableFiletypesSource = findNearestConfigField(orderPos, 'enableFiletypes', config);
    const languageIdsEnabled = applyEnableFiletypesToEnabledLanguageIds(
        config[languageIdsEnabledSource]?.enabledLanguageIds,
        config[enableFiletypesSource]?.enableFiletypes
    );
    const langSource = mergeSource(languageIdsEnabledSource, enableFiletypesSource);

    const cfg: Config = {
        inherited: { locales: keyMap[localeSource], languageIdsEnabled: keyMap[langSource] },
        locales: normalizeLocales(config[localeSource]?.language),
        languageIdsEnabled,
    };
    return cfg;
}

function mapExcludedBy(refs: GetConfigurationForDocumentResult['excludedBy']): FileConfig['excludedBy'] {
    if (!refs) return undefined;

    return refs.map((r) => ({
        ...r,
        name: r.name || (r.configUri && uriToName(toUri(r.configUri))),
    }));
}

function extractFileConfig(
    docConfig: GetConfigurationForDocumentResult,
    doc: vscode.TextDocument | undefined,
    log: Logger
): FileConfig | undefined {
    if (!doc) return undefined;
    const { uri, fileName, languageId, isUntitled } = doc;
    const { languageEnabled, docSettings, fileEnabled, fileIsExcluded, fileIsIncluded, gitignoreInfo, excludedBy } = docConfig;
    const enabledDicts = new Set<string>((docSettings && docSettings.dictionaries) || []);
    const dictionaries = extractDictionariesFromConfig(docSettings).filter((dic) => enabledDicts.has(dic.name));
    log(`extractFileConfig languageEnabled: ${languageEnabled ? 'true' : 'false'}`);
    const folder = vscode.workspace.getWorkspaceFolder(uri);

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
        uri: uri.toString(),
        fileName,
        isUntitled,
        languageId,
        dictionaries,
        languageEnabled,
        fileEnabled,
        configFiles: extractConfigFiles(docConfig),
        fileIsExcluded,
        fileIsIncluded,
        fileIsInWorkspace: !!folder,
        excludedBy: mapExcludedBy(excludedBy),
        gitignoreInfo: extractGitignoreInfo(),
        blockedReason: docConfig.blockedReason,
    };
    return cfg;
}

function getDefaultWorkspaceFolder() {
    return vscode.workspace.workspaceFolders?.[0];
}

function getDefaultWorkspaceFolderUri() {
    return getDefaultWorkspaceFolder()?.uri;
}

function normalizeFilenameToFriendlyName(filename: string | Uri): string {
    return vscode.workspace.asRelativePath(filename, true);
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

function extractDictionariesFromConfig(config: CSpellUserSettings | undefined): DictionaryEntry[] {
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

function mapDict(e: DictionaryDefinition): DictionaryEntry {
    const dictUri = Uri.joinPath(Uri.file(e.path || ''), e.file || '');
    const dictUriStr = dictUri.toString();
    const isCustomDict = regIsTextFile.test(dictUriStr) && !regIsCspellDict.test(dictUriStr);

    return {
        name: e.name,
        locales: [],
        languageIds: [],
        description: e.description,
        uri: isCustomDict ? dictUriStr : undefined,
        uriName: isCustomDict ? normalizeFilenameToFriendlyName(dictUri) : undefined,
    };
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
                .filter((a) => !!a)
        ),
        defaultTo([] as string[])
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

function applyEnableFiletypesToEnabledLanguageIds(
    languageIds: string[] | undefined = [],
    enableFiletypes: string[] | undefined = []
): string[] {
    const ids = new Set<string>();
    normalizeEnableFiletypes(languageIds.concat(enableFiletypes))
        .map(calcEnableLang)
        .forEach(({ enable, lang }) => {
            enable ? ids.add(lang) : ids.delete(lang);
        });
    return [...ids].sort();
}

function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
    const ids = enableFiletypes
        .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
        .sort()
        .map((id) => id.replace(/~/g, '!')); // Restore the !

    return ids;
}

function calcEnableLang(lang: string): { enable: boolean; lang: string } {
    const [pfx, value] = splitBangPrefix(lang);
    return {
        enable: !(pfx.length & 1),
        lang: value,
    };
}

function splitBangPrefix(value: string): [prefix: string, value: string] {
    const m = value.match(/^!*/);
    const pfx = m?.[0] || '';
    return [pfx, value.slice(pfx.length)];
}

export const __testing__ = {
    applyEnableFiletypesToEnabledLanguageIds,
    calcEnableLang,
    extractConfigFiles,
    extractDictionariesFromConfig,
    extractViewerConfigFromConfig,
    mapWorkspace,
    normalizeLocales,
    splitBangPrefix,
};
