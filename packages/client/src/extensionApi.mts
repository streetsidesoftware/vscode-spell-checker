import type { Uri } from 'vscode';

import type { CheckDocumentOptions, CheckDocumentResponse, DocumentInfo } from './api.mjs';
import type { CSpellClient } from './client/index.mjs';
import type { ConfigTargetLegacy } from './settings/index.mjs';

export interface ExtensionApi {
    registerConfig(path: string): void;
    triggerGetSettings(): void;
    enableLanguageId(languageId: string, uri?: string): Promise<void>;
    disableLanguageId(languageId: string, uri?: string): Promise<void>;
    enableCurrentFileType(): Promise<void>;
    disableCurrentFileType(): Promise<void>;
    addWordToUserDictionary(word: string): Promise<void>;
    addWordToWorkspaceDictionary(word: string, uri?: string | null | Uri): Promise<void>;
    enableLocale(target: ConfigTargetLegacy, locale: string): Promise<void>;
    disableLocale(target: ConfigTargetLegacy, locale: string): Promise<void>;
    updateSettings(): boolean;
    cSpellClient(): CSpellClient;
    checkDocument(doc: DocumentInfo, options?: CheckDocumentOptions): Promise<CheckDocumentResponse>;

    /**
     * @deprecated use {@link ExtensionApi.enableLocale}
     */
    enableLocal(isGlobal: boolean, locale: string): Promise<void>;
    /**
     * @deprecated use {@link ExtensionApi.disableLocale}
     */
    disableLocal(isGlobal: boolean, locale: string): Promise<void>;
    /**
     * @deprecated use {@link ExtensionApi.enableCurrentFileType}
     */
    enableCurrentLanguage(): Promise<void>;
    /**
     * @deprecated use {@link ExtensionApi.disableCurrentFileType}
     */
    disableCurrentLanguage(): Promise<void>;
}
