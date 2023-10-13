import { lookupLocaleInfo, normalizeCode } from '@internal/locale-resolver';
import { action, computed, makeObservable, observable } from 'mobx';
import type { ConfigSource, ConfigTarget, LocaleId, SettingByConfigTarget, Settings, TextDocument, WorkspaceFolder } from 'webview-api';

import type { Messenger } from '../api';
import { ConfigTargets, configTargets } from '../api/settings/settingsHelper';
import { uniqueFilter } from '../api/utils';
import { compareBy, compareEach } from '../api/utils/Comparable';

type TabTargets = ConfigTarget | 'file' | 'dictionaries' | 'about';

export interface Tab {
    label: string;
    target: TabTargets;
}

const tabs: Tab[] = [
    { label: 'User', target: 'user' },
    { label: 'Workspace', target: 'workspace' },
    { label: 'Folder', target: 'folder' },
    { label: 'File', target: 'file' },
    { label: 'Dictionaries', target: 'dictionaries' },
    { label: 'About', target: 'about' },
];

export interface LanguageInfo {
    code: string;
    /** 2-letter iso code */
    lang: string;
    language: string;
    name: string;
    script: string;
    dictionaries: string[];
    enabled: boolean;
}

export interface LanguageConfig {
    languages: LanguageInfo[];
    inherited?: ConfigSource;
}

export interface LanguageConfigs extends SettingByConfigTarget<LanguageConfig> {}

export interface State {
    activeTabName: string;
    settings: Settings;
    tabs: Tab[];
    activeTab: Tab;
    languageConfig: LanguageConfigs;
}

export interface FoundInConfig<T> {
    value: Exclude<T, undefined>;
    source: ConfigSource;
}

type InheritedFromSource<T> = {
    value: Exclude<T, undefined>;
    source: ConfigSource;
};

export class AppState implements State {
    @observable _activeTabName = '';
    @observable _settings: Settings = {
        dictionaries: [],
        knownLanguageIds: [],
        configs: {
            user: { inherited: {}, locales: [], languageIdsEnabled: [] },
            workspace: { inherited: { locales: 'user', languageIdsEnabled: 'user' }, locales: [], languageIdsEnabled: [] },
            folder: { inherited: { locales: 'user', languageIdsEnabled: 'user' }, locales: [], languageIdsEnabled: [] },
            file: undefined,
        },
    };
    @observable debugMode = false;

    constructor(private messageBus: Messenger) {
        makeObservable(this);
    }

    @computed get activeTabName() {
        return this._activeTabName;
    }

    @computed get settings() {
        return this._settings;
    }

    @computed get tabs() {
        const hidden = new Set<TabTargets>(configTargets.filter((target) => !this.settings.configs[target]));
        if (this.workspaceFolders.length <= 1) {
            hidden.add(ConfigTargets.folder);
        }
        if (this.workspaceFolders.length < 1) {
            hidden.add(ConfigTargets.workspace);
        }
        if (!this.settings.activeFileUri) {
            hidden.add('file');
        }
        return tabs.filter((tab) => !hidden.has(tab.target));
    }

    @computed get activeTab() {
        return this.tabs.find((t) => t.label === this.activeTabName) || this.tabs[0];
    }

    @computed get languageConfig(): LanguageConfigs {
        const calcConfig = (target: ConfigTarget): LanguageConfig => {
            const config = this.settings.configs[target];
            const locales = config.locales; // todo: calc inheritance
            const inherited = config.inherited.locales;

            const infos = new Map<string, LanguageInfo>();

            const addLocalesToInfos = (locales: string[], dictionaryName: string | undefined) => {
                locales
                    .map((code) => normalizeCode(code))
                    .map(lookupLocaleInfo)
                    .filter(isDefined)
                    .forEach((localInfo) => {
                        const { code, lang, language, script = '', country } = localInfo;
                        const name = language + (country && ' - ' + country) + (script && ' - ' + script);
                        const found = this.isLocalEnabledEx(target, code);
                        const enabled = (found && found.value) || false;
                        const info: LanguageInfo = infos.get(name) || {
                            code,
                            lang,
                            name,
                            language,
                            enabled,
                            script,
                            dictionaries: [],
                        };
                        if (dictionaryName) {
                            info.dictionaries.push(dictionaryName);
                        }
                        infos.set(name, info);
                    });
            };
            if (locales) {
                addLocalesToInfos(locales, undefined);
            }
            this.settings.dictionaries.forEach((dict) => addLocalesToInfos(dict.locales, dict.name));

            return {
                languages: [...infos.values()].sort(
                    compareEach(
                        compareBy((info) => !info.dictionaries.length),
                        compareBy('name'),
                    ),
                ),
                inherited,
            };
        };

        return {
            user: calcConfig('user'),
            workspace: calcConfig('workspace'),
            folder: calcConfig('folder'),
        };
    }

    @computed get activeTabIndex(): number {
        const index = this.tabs.findIndex((t) => t.label === this.activeTabName);
        return index > 0 ? index : 0;
    }

    @computed get workspaceFolderNames(): string[] {
        const workspace = this.settings.workspace;
        const folders = (workspace && workspace.workspaceFolders) || [];
        return folders.map((f) => f.name);
    }

    @computed get activeWorkspaceFolder(): string | undefined {
        const folder = this.findMatchingFolder(this.settings.activeFolderUri);
        return folder && folder.name;
    }

    @computed get workspaceFolders(): WorkspaceFolder[] {
        const workspace = this.settings.workspace;
        return (workspace && workspace.workspaceFolders) || [];
    }

    @computed get activeFileUri(): string | undefined {
        return this.settings.activeFileUri;
    }

    @computed get documents(): TextDocument[] {
        const workspace = this.settings.workspace;
        return (workspace && workspace.textDocuments) || [];
    }

    @computed get documentSelection(): { label: string; value: string }[] {
        return this.documents.map((doc) => ({ label: doc.fileName, value: doc.uri }));
    }

    private findMatchingFolder(uri: string | undefined): WorkspaceFolder | undefined {
        return this.workspaceFolders.filter((f) => f.uri === uri)[0];
    }

    private findMatchingFolderByName(name: string | undefined): WorkspaceFolder | undefined {
        return this.workspaceFolders.filter((f) => f.name === name)[0];
    }

    @action actionSetLocale(target: ConfigTarget, locale: LocaleId, enable: boolean) {
        const localesCurrent = this.settings.configs[target].locales;
        const locales = (enable ? [...localesCurrent, locale] : localesCurrent.filter((v) => v !== locale)).filter(uniqueFilter());
        this.settings.configs[target].locales = locales;
        const uri = this.settings.activeFolderUri;
        this.messageBus.postMessage({ command: 'EnableLocaleMessage', value: { target, locale, enable, uri } });
    }

    @action actionSetDebugMode(isEnabled: boolean) {
        this.debugMode = isEnabled;
    }

    private isLocalEnabledEx(field: ConfigTarget, code: LocaleId): InheritedFromSource<boolean> {
        const config = this.settings.configs[field];
        const source = config.inherited.locales || field;
        const locales = config.locales;
        return {
            value: locales.map(normalizeCode).includes(code),
            source,
        };
    }

    @action actionActivateTabIndex(index: number) {
        const tab = this.tabs[index];
        if (tab) {
            this.actionActivateTab(tab.label);
        }
    }

    @action actionActivateTab(tabName: string) {
        this._activeTabName = tabName;
        this.messageBus.postMessage({ command: 'SelectTabMessage', value: this.activeTabName });
    }

    @action actionSelectFolder(folderName: string) {
        const folder = this.findMatchingFolderByName(folderName);
        const folderUri = folder && folder.uri;
        this.settings.activeFolderUri = folderUri;
        if (folderUri !== undefined) {
            this.messageBus.postMessage({ command: 'SelectFolderMessage', value: folderUri });
        }
    }

    @action actionSelectDocument(documentUri: string) {
        this.messageBus.postMessage({ command: 'SelectFileMessage', value: documentUri });
    }

    @action actionEnableLanguageId(languageId: string, enable: boolean, target?: ConfigTarget) {
        const fileConfig = this.settings.configs.file;
        if (!target && fileConfig?.languageId === languageId) {
            fileConfig.languageEnabled = enable;
        }
        const uri = (!target && fileConfig?.uri) || this.settings.activeFolderUri;
        this.messageBus.postMessage({ command: 'EnableLanguageIdMessage', value: { languageId, enable, target, uri } });
    }

    @action updateSettings(settings: Settings): Settings {
        this._settings = settings;
        return this._settings;
    }
}

function isDefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}
