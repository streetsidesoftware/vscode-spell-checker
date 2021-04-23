import type { CSpellUserSettings } from '@cspell/cspell-types';
import { TextDocument } from 'vscode';

export interface ExtensionApi {
    registerConfig(path: string): void;
    triggerGetSettings(): void;
    enableLanguageId(languageId: string, uri?: string): Thenable<void>;
    disableLanguageId(languageId: string, uri?: string): Thenable<void>;
    enableCurrentLanguage(): Thenable<void>;
    disableCurrentLanguage(): Thenable<void>;
    addWordToUserDictionary(word: string): Thenable<void>;
    addWordToWorkspaceDictionary(word: string, uri?: string | null): Thenable<void>;
    // enableLocale(target: ConfigTarget, locale: string): Thenable<void>;
    // disableLocale(target: ConfigTarget, locale: string): Thenable<void>;
    updateSettings(): boolean;
    cSpellClient(): CSpellClient;
}

export interface CSpellClient {
    getConfigurationForDocument(document: TextDocument | undefined): Promise<GetConfigurationForDocumentResult>;
}
export interface GetConfigurationForDocumentResult {
    languageEnabled: boolean | undefined;
    fileEnabled: boolean | undefined;
    settings: CSpellUserSettings | undefined;
    docSettings: CSpellUserSettings | undefined;
    excludedBy: ExcludeRef[] | undefined;
}

export interface ExcludeRef {
    glob: string;
    id: string | undefined;
    name: string | undefined;
    filename: string | undefined;
}
