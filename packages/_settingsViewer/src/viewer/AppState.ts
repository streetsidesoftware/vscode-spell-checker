import {observable, computed} from 'mobx';
import { Settings, ConfigTarget, LocalId, isConfigTarget, SettingByConfigTarget } from '../api/settings/';
import { normalizeCode, lookupCode } from '../iso639-1';
import { compareBy, compareEach, reverse, compareByRev } from '../api/utils/Comparable';


type Maybe<T> = T | undefined;

export interface Tab {
    label: string;
    target: ConfigTarget | 'dictionaries' | 'languages';
}

const tabs: Tab[] = [
    { label: 'User', target: 'user' },
    { label: 'Workspace', target: 'workspace' },
    { label: 'Folder', target: 'folder' },
    { label: 'Dictionaries', target: 'dictionaries' },
    { label: 'Language', target: 'languages' },
];

export interface LanguageInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled: boolean;
}

export interface LanguageConfig extends SettingByConfigTarget<Maybe<LanguageInfo[]>> {}

export interface LocalInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled?: boolean;
    isInUserSettings?: boolean;
    isInWorkspaceSettings?: boolean;
    isInFolderSettings?: boolean;
}


export interface State {
    activeTabIndex: number;
    timer: number;
    counter: number;
    settings: Settings;
    tabs: Tab[];
    activeTab: Tab;
    locals: LocalInfo[];
    languageConfig: LanguageConfig;
}

export class AppState implements State {
    @observable activeTabIndex = 0;
    @observable timer = 0;
    @observable counter = 0;
    @observable settings: Settings = {
        locals: {
            user: ['en', 'es'],
            workspace: undefined,
            folder: undefined,
            file: ['en'],
        },
        dictionaries: [
        ],
        configs: {
            user: undefined,
            workspace: undefined,
            folder: undefined,
            file: undefined,
        }
    };

    @computed get tabs() {
        return tabs.filter(tab => !isConfigTarget(tab.target) || this.settings.configs[tab.target]);
    }

    @computed get activeTab() {
        return this.tabs[this.activeTabIndex];
    }

    @computed get locals(): LocalInfo[] {
        const infos = new Map<string, LocalInfo>();

        const settingLocals = this.settings.locals;

        const locals = [
            ...(settingLocals.user || []),
            ...(settingLocals.workspace || []),
            ...(settingLocals.folder || []),
            ...(settingLocals.file || []),
        ];

        const addLocalsToInfos = (locals: string[], dictionaryName: string | undefined) => {
            locals.map(normalizeCode).map(lookupCode).filter(notUndefined).forEach(lang => {
                const { code, lang: language, country } = lang;
                const name = country ? `${language} - ${country}` : language;
                const user = this.isLocalEnabled('user', code);
                const file = this.isLocalEnabled('file', code);
                const workspace = this.isLocalEnabled('workspace', code);
                const folder = this.isLocalEnabled('folder', code);
                const info: LocalInfo = infos.get(name) || {
                    code,
                    name,
                    isInFolderSettings: folder,
                    isInUserSettings: user,
                    isInWorkspaceSettings: workspace,
                    enabled: file,
                    dictionaries: [],
                };
                if (dictionaryName) {
                    info.dictionaries.push(dictionaryName);
                }
                infos.set(name, info);
            });
        }

        addLocalsToInfos(locals, undefined);
        this.settings.dictionaries.forEach(dict => addLocalsToInfos(dict.locals, dict.name));

        return [...infos].map(([_, info]) => info);
    }

    @computed get languageConfig(): LanguageConfig {
        const calcConfig = (target: ConfigTarget): Maybe<LanguageInfo[]> => {
            const config = this.settings.configs[target];
            if (!config) {
                return undefined;
            }
            const locals = config.locals || []; // todo: calc inheritance

            const infos = new Map<string, LanguageInfo>();

            const addLocalsToInfos = (locals: string[], dictionaryName: string | undefined) => {
                locals.map(normalizeCode).map(lookupCode).filter(notUndefined).forEach(lang => {
                    const { code, lang: language, country } = lang;
                    const name = country ? `${language} - ${country}` : language;
                    const enabled = !!this.isLocalEnabled(target, code);
                    const info: LanguageInfo = infos.get(name) || {
                        code,
                        name,
                        enabled,
                        dictionaries: [],
                    };
                    if (dictionaryName) {
                        info.dictionaries.push(dictionaryName);
                    }
                    infos.set(name, info);
                });
            }
            addLocalsToInfos(locals, undefined);
            this.settings.dictionaries.forEach(dict => addLocalsToInfos(dict.locals, dict.name));

            return [...infos.values()].sort(compareEach(
                compareByRev('enabled'),
                compareBy('name'),
            ));
        };

        return {
            user: calcConfig('user'),
            workspace: calcConfig('workspace'),
            folder: calcConfig('folder'),
            file: calcConfig('file'),
        }
    }

    constructor() {
        setInterval(() => {
            this.timer += 1;
        }, 1000);
    }

    resetTimer() {
        this.timer = 0;
    }

    setLocal(field: ConfigTarget, code: LocalId, checked: boolean) {
        if (checked) {
            const locals = this.settings.locals[field] || [];
            locals.push(code);
            this.settings.locals[field] = locals;
        } else {
            const locals = this.settings.locals[field] || [];
            if (locals.includes(code)) {
                locals.splice(locals.findIndex(c => c === code), 1);
                this.settings.locals[field] = locals.length > 0 ? locals : undefined;
            }
        }
    }

    isLocalEnabled(field: ConfigTarget, code: LocalId): boolean | undefined {
        const local = this.settings.locals[field];
        return local === undefined ? undefined : local.map(normalizeCode).includes(code);
    }
}

function notUndefined<T>(a : T): a is Exclude<T, undefined> {
    return a !== undefined;
}


