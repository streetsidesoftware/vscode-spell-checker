import { constructSettingsForText, getDictionary } from 'cspell-lib';
import type { TextDocuments } from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

import type { SpellingSuggestionsResult, TextDocumentInfo } from './api.js';
import type { CSpellUserSettings } from './config/cspellConfig/index.mjs';
import type { GetSettingsResult } from './SuggestionsGenerator.mjs';
import { SuggestionGenerator } from './SuggestionsGenerator.mjs';

export interface SuggestionsServerDependencies {
    fetchSettings: (doc?: TextDocumentInfo) => Promise<CSpellUserSettings>;
    getSettingsVersion: (doc?: TextDocumentInfo) => number;
}

export function createOnSuggestionsHandler(
    documents: TextDocuments<TextDocument>,
    dependencies: SuggestionsServerDependencies,
): (word: string, doc?: TextDocumentInfo) => Promise<SpellingSuggestionsResult> {
    const codeActionHandler = new SuggestionsServer(documents, dependencies);

    return (word: string, doc?: TextDocumentInfo) => codeActionHandler.genSuggestions(word, doc);
}

type SettingsDictPair = GetSettingsResult;
interface CacheEntry {
    docVersion: number | undefined;
    settingsVersion: number;
    settings: Promise<SettingsDictPair>;
}

class SuggestionsServer {
    private sugGen: SuggestionGenerator<TextDocumentInfo | undefined>;
    private settingsCache: Map<string | undefined, CacheEntry>;

    constructor(
        readonly documents: TextDocuments<TextDocument>,
        readonly dependencies: SuggestionsServerDependencies,
    ) {
        this.settingsCache = new Map<string, CacheEntry>();
        this.sugGen = new SuggestionGenerator((doc) => this.getSettings(doc));
    }

    async getSettings(doc?: TextDocumentInfo): Promise<GetSettingsResult> {
        const cached = this.settingsCache.get(doc?.uri);
        const settingsVersion = this.dependencies.getSettingsVersion(doc);
        if (cached?.docVersion === doc?.version && cached?.settingsVersion === settingsVersion) {
            return cached.settings;
        }
        const settings = this.constructSettings(doc);
        this.settingsCache.set(doc?.uri, { docVersion: doc?.version, settings, settingsVersion });
        return settings;
    }

    private async constructSettings(doc?: TextDocumentInfo): Promise<SettingsDictPair> {
        const document = doc && this.documents.get(doc.uri);
        const text = doc?.text ?? (document?.getText() || '');
        const langId = doc?.languageId || document?.languageId || 'plaintext';
        const settings = constructSettingsForText(await this.dependencies.fetchSettings(doc), text, langId);
        const dictionary = await getDictionary(settings);
        return { settings, dictionary };
    }

    public async genSuggestions(word: string, doc?: TextDocumentInfo): Promise<SpellingSuggestionsResult> {
        const suggestions = await this.sugGen.genWordSuggestions(doc, word);
        return { suggestions };
    }
}
