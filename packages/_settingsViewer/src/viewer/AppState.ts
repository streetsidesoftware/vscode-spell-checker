import {observable, computed} from 'mobx';
import { Settings, ConfigTarget, LocalId, isConfigTarget, SettingByConfigTarget, configTargetOrder, Config, Configs, LocalList } from '../api/settings/';
import { normalizeCode, lookupCode } from '../iso639-1';
import { compareBy, compareEach } from '../api/utils/Comparable';
import { uniqueFilter } from '../api/utils';


type Maybe<T> = T | undefined;

export interface Tab {
    label: string;
    target: ConfigTarget | 'dictionaries' | 'about';
}

const targetToLabel: SettingByConfigTarget<string> = {
    user: 'User',
    workspace: 'Workspace',
    folder: 'Folder',
    file: 'File',
}

const tabs: Tab[] = [
    { label: 'User', target: 'user' },
    { label: 'Workspace', target: 'workspace' },
    { label: 'Folder', target: 'folder' },
    { label: 'Dictionaries', target: 'dictionaries' },
    { label: 'About', target: 'about' },
];

export interface LanguageInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled: boolean;
}

export interface LanguageConfig {
    languages: LanguageInfo[];
    inherited?: ConfigTarget;
}

export interface LanguageConfigs extends SettingByConfigTarget<LanguageConfig> {}

export interface State {
    activeTabIndex: number;
    timer: number;
    counter: number;
    settings: Settings;
    tabs: Tab[];
    activeTab: Tab;
    languageConfig: LanguageConfigs;
}

export interface FoundInConfig<T> {
    value: Exclude<T, undefined>,
    target: ConfigTarget
}

type InheritedFromTarget<T> = undefined | {
    value: Exclude<T, undefined>,
    target: ConfigTarget;
}


type InheritMembers<T> = {
    [K in keyof T]: InheritedFromTarget<T[K]>;
}

type InheritedConfig = InheritMembers<Config>;
type InheritedConfigs = SettingByConfigTarget<InheritedConfig>;

export class AppState implements State {
    @observable activeTabIndex = 0;
    @observable timer = 0;
    @observable counter = 0;
    @observable settings: Settings = {
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

    @computed get languageConfig(): LanguageConfigs {
        const calcConfig = (target: ConfigTarget): LanguageConfig => {
            const config = this.inheritedConfigs[target];
            if (!config) {
                return { languages: [] };
            }
            const locals = config.locals; // todo: calc inheritance
            const inherited = locals && locals.target;

            const infos = new Map<string, LanguageInfo>();

            const addLocalsToInfos = (locals: string[], dictionaryName: string | undefined) => {
                locals.map(normalizeCode).map(lookupCode).filter(notUndefined).forEach(lang => {
                    const { code, lang: language, country } = lang;
                    const name = country ? `${language} - ${country}` : language;
                    const found = this.isLocalEnabledEx(target, code);
                    const enabled = found && found.value || false;
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
            if (locals) {
                addLocalsToInfos(locals.value, undefined);
            }
            this.settings.dictionaries.forEach(dict => addLocalsToInfos(dict.locals, dict.name));

            return {
                languages: [...infos.values()].sort(compareEach(
                    compareBy(info => !info.dictionaries.length),
                    compareBy('name'),
                )),
                inherited
            };
        };

        return {
            user: calcConfig('user'),
            workspace: calcConfig('workspace'),
            folder: calcConfig('folder'),
            file: calcConfig('file'),
        }
    }

    @computed get inheritedConfigs(): InheritedConfigs {
        return calcInheritableConfig(this.settings.configs);
    }

    constructor() {
        setInterval(() => {
            this.timer += 1;
        }, 1000);
    }

    targetToLabel(target: ConfigTarget): string {
        return targetToLabel[target];
    }

    resetTimer() {
        this.timer = 0;
    }

    setLocal(field: ConfigTarget, code: LocalId, checked: boolean) {
        const inherited = this.inheritedConfigs[field].locals;
        const locals = inherited && inherited.value || [];
        if (checked) {
            this.setLocals(field, [code, ...locals]);
        } else {
            const filtered = locals.filter(a => a !== code);
            if (!filtered.length || filtered.length !== locals.length) {
                this.setLocals(field, filtered);
            }
        }
    }

    setLocals(target: ConfigTarget, locals: LocalList | undefined) {
        locals = locals ? locals.filter(uniqueFilter()) : undefined;
        locals = locals && locals.length ? locals : undefined;
        const config = this.settings.configs[target] || {
            locals: undefined,
            fileTypesEnabled: undefined,
        };
        config.locals = locals;
        this.settings.configs[target] = config;
    }

    isLocalEnabled(field: ConfigTarget, code: LocalId): boolean | undefined {
        const found = this.isLocalEnabledEx(field, code);
        return found === undefined ? undefined : found.value;
    }

    isLocalEnabledEx(field: ConfigTarget, code: LocalId):InheritedFromTarget<boolean> {
        const locals = this.inheritedConfigs[field].locals;
        if (locals === undefined) return undefined;
        return  {
            value: locals.value.map(normalizeCode).includes(code),
            target: locals.target
        };
    }
}

function calcInheritableConfig(configs: Configs): InheritedConfigs {
    function peek(target: ConfigTarget, inherited: InheritedConfig): InheritedConfig {
        const cfg = configs[target];
        if (cfg == undefined) return inherited;
        const inCfg = {...inherited};
        for (const k of Object.keys(inherited) as (keyof InheritedConfig)[]) {
            const value = cfg[k];
            if (value !== undefined && value.length > 0) {
                inCfg[k] = { value, target };
            }
        }
        return inCfg;
    }
    const defaultCfg: InheritedConfig = { locals: undefined, fileTypesEnabled: undefined };
    const user = peek('user', defaultCfg);
    const workspace = peek('workspace', user);
    const folder = peek('folder', workspace);
    const file = peek('file', folder);
    return { user, workspace, folder, file };
}

function notUndefined<T>(a : T): a is Exclude<T, undefined> {
    return a !== undefined;
}


