import {observable, computed} from 'mobx';
import { Settings, ConfigTarget, LocalId } from '../api/settings/';
import { normalizeCode, lookupCode, LangCountryPair } from '../iso639-1';

export const cats = [
    { title: 'Coding Cat', image: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', icon: 'home'},
    { title: 'Compiling Cat', image: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif', icon: 'face'},
    { title: 'Testing Cat', image: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', icon: 'favorite'},
];

export const tabLabels = ['Language'].concat(cats.map(cat => cat.title));

export interface LocalInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled?: boolean;
    isInUserSettings?: boolean;
    isInWorkspaceSettings?: boolean;
    isInFolderSettings?: boolean;
}


export class AppState {
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
    };

    @computed get activeTab() {
        return tabLabels[this.activeTabIndex];
    }

    @computed get locals(): LocalInfo[] {
        const infos = new Map<string, LocalInfo>();

        this.settings.dictionaries.forEach(dict => {
            dict.locals.map(normalizeCode).map(lookupCode).filter(notUndefined).forEach(lang => {
                const { code, lang: language, country } = lang;
                const name = country ? `${language} ${country}` : language;
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
                info.dictionaries.push(dict.name);
                infos.set(name, info);
            });
        });

        return [...infos].map(([_, info]) => info);
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
