import { toUri, uriToName } from 'common-utils/uriHelper';
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
import { CSpellClient } from '../client';
import type { ConfigTarget, ConfigTargetCSpell, CSpellUserSettings, GetConfigurationForDocumentResult } from '../server';
import { Inspect, inspectConfig, InspectValues } from '../settings';
import { Maybe, uniqueFilter } from '../util';
import { defaultTo, map, pipe } from '../util/pipe';

type Logger = typeof console.log;

function getDefaultWorkspaceFolder() {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
}

function getDefaultWorkspaceFolderUri() {
    const folder = getDefaultWorkspaceFolder();
    return folder && folder.uri;
}

function normalizeFileName(filename: string): string {
    return vscode.workspace.asRelativePath(filename, true);
}

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
        workspace: mapWorkspace(client.allowedSchemas),
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
    function findNearestConfigField<K extends keyof CSpellUserSettings>(orderPos: keyof ConfigOrder, key: K): InspectKeys {
        for (let i = orderPos; i > 0; --i) {
            const inspectKey = configOrder[i];
            const setting = config[inspectKey];
            if (setting && setting[key]) {
                return inspectKey;
            }
        }
        return 'defaultValue';
    }

    function applyEnableFiletypesToEnabledLanguageIds(
        languageIds: string[] | undefined = [],
        enableFiletypes: string[] | undefined = []
    ): string[] {
        const ids = new Set(languageIds);
        normalizeEnableFiletypes(enableFiletypes)
            .map((lang) => ({ enable: lang[0] !== '!', lang: lang.replace('!', '') }))
            .forEach(({ enable, lang }) => {
                if (enable) {
                    ids.add(lang);
                } else {
                    ids.delete(lang);
                }
            });
        return [...ids];
    }

    function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
        const ids = enableFiletypes
            .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
            .sort()
            .map((id) => id.replace(/~/g, '!')) // Restore the !
            .map((id) => id.replace(/^(!!)+/, '')); // Remove extra !! pairs

        return ids;
    }

    function inspectKeyToOrder(a: InspectKeys): number {
        return configOrderRev.get(a) || 0;
    }

    function mergeSource(a: InspectKeys, b: InspectKeys): InspectKeys {
        return inspectKeyToOrder(a) > inspectKeyToOrder(b) ? a : b;
    }

    function extractNearestConfig(orderPos: keyof ConfigOrder): Config {
        const localeSource = findNearestConfigField(orderPos, 'language');
        const languageIdsEnabledSource = findNearestConfigField(orderPos, 'enabledLanguageIds');
        const enableFiletypesSource = findNearestConfigField(orderPos, 'enableFiletypes');
        const languageIdsEnabled = applyEnableFiletypesToEnabledLanguageIds(
            config[languageIdsEnabledSource]!.enabledLanguageIds,
            config[enableFiletypesSource]!.enableFiletypes
        );
        const langSource = mergeSource(languageIdsEnabledSource, enableFiletypesSource);

        const cfg: Config = {
            inherited: { locales: keyMap[localeSource], languageIdsEnabled: keyMap[langSource] },
            locales: normalizeLocales(config[localeSource]!.language),
            languageIdsEnabled,
        };
        return cfg;
    }

    function extractFileConfig(): FileConfig | undefined {
        const { languageEnabled, docSettings, fileEnabled } = docConfig;
        if (!doc) return undefined;
        const { uri, fileName, languageId, isUntitled } = doc;
        const enabledDicts = new Set<string>((docSettings && docSettings.dictionaries) || []);
        const dictionaries = extractDictionariesFromConfig(docSettings).filter((dic) => enabledDicts.has(dic.name));
        log(`extractFileConfig languageEnabled: ${languageEnabled ? 'true' : 'false'}`);
        const cfg: FileConfig = {
            uri: uri.toString(),
            fileName,
            isUntitled,
            languageId,
            dictionaries,
            languageEnabled,
            fileEnabled,
            configFiles: extractConfigFiles(docConfig),
        };
        return cfg;
    }

    return {
        user: extractNearestConfig(1),
        workspace: extractNearestConfig(2),
        folder: extractNearestConfig(3),
        file: extractFileConfig(),
    };
}

function extractConfigFiles(docConfig: GetConfigurationForDocumentResult): ConfigFile[] {
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

function extractDictionariesFromConfig(config: CSpellUserSettings | undefined): DictionaryEntry[] {
    if (!config) {
        return [];
    }

    const dictionaries = config.dictionaryDefinitions || [];
    const dictionariesByName = new Map(
        dictionaries
            .map((e) => ({ name: e.name, locales: [], languageIds: [], description: e.description }))
            .map((e) => [e.name, e] as [string, DictionaryEntry])
    );
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

function normalizeLocales(locale: string | string[] | undefined) {
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

function mapWorkspace(allowedSchemas: Set<string>): Workspace {
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
            fileName: normalizeFileName(fileName),
            languageId,
            isUntitled,
        };
    }

    const { name, workspaceFolders, textDocuments } = vscode.workspace;
    const workspace: Workspace = {
        name,
        workspaceFolders: workspaceFolders ? workspaceFolders.map(mapWorkspaceFolder) : undefined,
        textDocuments: textDocuments.filter((td) => allowedSchemas.has(td.uri.scheme)).map(mapTextDocuments),
    };

    return workspace;
}
