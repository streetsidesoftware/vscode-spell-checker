import type { Uri } from 'vscode';

import type { CSpellClient } from './client';
import type { ConfigTargetLegacy } from './settings';

export interface ExtensionApi {
    registerConfig(path: string): void;
    triggerGetSettings(): void;
    enableLanguageId(languageId: string, uri?: string): Thenable<void>;
    disableLanguageId(languageId: string, uri?: string): Thenable<void>;
    enableCurrentLanguage(): Thenable<void>;
    disableCurrentLanguage(): Thenable<void>;
    addWordToUserDictionary(word: string): Thenable<void>;
    addWordToWorkspaceDictionary(word: string, uri?: string | null | Uri): Thenable<void>;
    enableLocale(target: ConfigTargetLegacy, locale: string): Thenable<void>;
    disableLocale(target: ConfigTargetLegacy, locale: string): Thenable<void>;
    updateSettings(): boolean;
    cSpellClient(): CSpellClient;
    enableLocal(isGlobal: boolean, locale: string): Thenable<void>;
    disableLocal(isGlobal: boolean, locale: string): Thenable<void>;
}
