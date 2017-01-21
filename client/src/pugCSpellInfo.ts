import * as ph from './pugHelper';

const templateName = 'CSpellInfoPreview.pug';

export interface TemplateVariables {
    filename: string;
    fileEnabled: boolean;
    languageEnabled: boolean;
    languageId: string;
    spellingErrors: [string, number][];
    linkEnableDisableLanguage: string;
}

export function render(params: TemplateVariables) {
    return ph.render(templateName, params);
}
