import * as ph from './pugHelper';

const templateName = 'CSpellInfoPreview.pug';

export interface LocalInfo {
    code: string;
    name: string;
    enabled?: boolean;
    isInUserSettings?: boolean;
    isInWorkspaceSettings?: boolean;
}

export type ActiveTab = 'LocalInfo' | 'FileInfo' | 'IssuesInfo';

export interface TemplateVariables {
    filename: string;
    fileEnabled: boolean;
    languageEnabled: boolean;
    languageId: string;
    spellingErrors: [string, number][] | undefined;
    linkEnableDisableLanguage: string;
    linkEnableLanguage: string;
    linkDisableLanguage: string;
    imagesPath: string;
    localInfo: LocalInfo[];
    local: string[];
    availableLocals: string[];
    activeTab: ActiveTab;
    genSetLocal: (code: string, enabled: boolean, isGlobal: boolean) => string;
    genSelectInfoTabLink: (tab: string) => string;
}

export function render(params: TemplateVariables) {
    return ph.render(templateName, params);
}
