import * as ph from './pugHelper';

const templateName = 'CSpellInfoPreview.pug';

export interface LocalInfo {
    code: string;
    name: string;
    enabled: boolean;
    dictionaryNames: string[];
}

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
    local: string[];
    availableLocals: string[];
}

export function render(params: TemplateVariables) {
    return ph.render(templateName, params);
}
