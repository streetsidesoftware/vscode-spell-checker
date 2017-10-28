import * as ph from './pugHelper';

const templateName = 'CSpellInfoPreview.pug';

export interface LocalInfo {
    code: string;
    name: string;
    dictionaries: string[];
    enabled?: boolean;
    isInUserSettings?: boolean;
    isInWorkspaceSettings?: boolean;
}

export type ActiveTab = 'LocalInfo' | 'FileInfo' | 'IssuesInfo';

export interface DictionaryEntry {
    name: string;
    description?: string;
}

export interface LocalSetting {
    default?: string;
    user?: string;
    workspace?: string;
}

export interface TemplateVariables {
    useDarkTheme: boolean;
    filename: string;
    fileEnabled: boolean;
    dictionariesForFile: string[];
    isDictionaryInUse: (dictId: string) => boolean;
    dictionaries: DictionaryEntry[];
    languageEnabled: boolean;
    languageId: string;
    spellingErrors: [string, number][] | undefined;
    linkEnableDisableLanguage: string;
    linkEnableLanguage: string;
    linkDisableLanguage: string;
    imagesPath: string;
    localInfo: LocalInfo[];
    local: LocalSetting;
    availableLocals: string[];
    activeTab: ActiveTab;
    genSetLocal: (code: string, enabled: boolean, isGlobal: boolean) => string;
    genSelectInfoTabLink: (tab: ActiveTab) => string;
    genOverrideLocal: (enable: boolean, isGlobal: boolean) => string;
}

export function render(params: TemplateVariables) {
    return ph.render(templateName, params);
}
