import type { Uri } from 'vscode';

import type { CSpellClient } from './client/index.mjs';
import type { ConfigTargetLegacy } from './settings/index.mjs';

export interface ExtensionApi {
    registerConfig(path: string): void;
    triggerGetSettings(): void;
    enableLanguageId(languageId: string, uri?: string): Thenable<void>;
    disableLanguageId(languageId: string, uri?: string): Thenable<void>;
    enableCurrentFileType(): Thenable<void>;
    disableCurrentFileType(): Thenable<void>;
    addWordToUserDictionary(word: string): Thenable<void>;
    addWordToWorkspaceDictionary(word: string, uri?: string | null | Uri): Thenable<void>;
    enableLocale(target: ConfigTargetLegacy, locale: string): Thenable<void>;
    disableLocale(target: ConfigTargetLegacy, locale: string): Thenable<void>;
    updateSettings(): boolean;
    cSpellClient(): CSpellClient;

    /**
     * @deprecated use {@link ExtensionApi.enableLocale}
     */
    enableLocal(isGlobal: boolean, locale: string): Thenable<void>;
    /**
     * @deprecated use {@link ExtensionApi.disableLocale}
     */
    disableLocal(isGlobal: boolean, locale: string): Thenable<void>;
    /**
     * @deprecated use {@link ExtensionApi.enableCurrentFileType}
     */
    enableCurrentLanguage(): Thenable<void>;
    /**
     * @deprecated use {@link ExtensionApi.disableCurrentFileType}
     */
    disableCurrentLanguage(): Thenable<void>;
}
