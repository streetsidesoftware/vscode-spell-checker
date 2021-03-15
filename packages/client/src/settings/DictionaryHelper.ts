import { CSpellClient } from '../client';
import { Target } from './config';
import * as config from './config';
import { resolveTarget, addWordToSettings, determineSettingsPath } from './settings';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import { addWordToSettingsAndUpdate } from './CSpellSettings';
import { CSpellUserSettings, DictionaryDefinition } from '../server';
import * as fs from 'fs-extra';
import { unique } from '../util';

const defaultEncoding = 'utf8';

interface CustomDictionaryWithPath {
    name: string;
    path: string;
}

export class DictionaryHelper {
    constructor(public client: CSpellClient) {}

    public async addWordToTarget(word: string, target: Target, uri: string | null | Uri | undefined): Promise<void> {
        const actualTarget = resolveTarget(target, uri);
        const customDicts = await this.getCustomDictionariesForTargetFromConfig(actualTarget);

        if (!customDicts.length) {
            return this.addWordsToConfig(word, actualTarget);
        }

        await this.addWordsToCustomDictionaries([word], customDicts);
        return this.client.notifySettingsChanged();
    }

    private async getDocConfig(uri: string | null | Uri | undefined) {
        if (uri) {
            const doc = await vscode.workspace.openTextDocument(uri as Uri);
            return this.client.getConfigurationForDocument(doc);
        }
        return this.client.getConfigurationForDocument(undefined);
    }

    private async addWordsToConfig(word: string, actualTarget: config.ConfigTarget) {
        const uri = config.extractTargetUri(actualTarget);
        await addWordToSettings(actualTarget, word);
        const paths = await determineSettingsPath(actualTarget, uri);
        await Promise.all(paths.map((path) => addWordToSettingsAndUpdate(path, word)));
    }

    private async getCustomDictionariesForTargetFromConfig(target: config.ConfigTarget) {
        const uri = config.extractTargetUri(target);
        const docConfig = await this.getDocConfig(uri);
        const dicts = DictionaryHelper.extractCustomDictionaries(docConfig.docSettings || docConfig.settings, config.extractTarget(target));
        return dicts;
    }

    private static extractCustomDictionaries(docConfig: CSpellUserSettings | undefined, target: Target): CustomDictionaryWithPath[] {
        function extractDicts() {
            switch (target) {
                case Target.Workspace:
                    return docConfig?.customWorkspaceDictionaries || [];
                case Target.WorkspaceFolder:
                    return docConfig?.customFolderDictionaries || [];
            }
            return docConfig?.customUserDictionaries || [];
        }

        const dictionaries = new Map((docConfig?.dictionaryDefinitions || []).map((d) => [d.name, d]));
        const custom = extractDicts()
            .map((d) => (typeof d === 'string' ? d : d.addWords ? d.name : undefined))
            .filter(isDefined)
            .map((name) => dictionaries.get(name))
            .filter(isDictionaryWithPath);
        return custom;
    }

    async addWordsToCustomDictionaries(words: string[], dicts: CustomDictionaryWithPath[]): Promise<void> {
        const process = dicts
            .map((dict) => this.addWordsToCustomDictionary(words, dict))
            .map((p) => p.catch((e: Error) => vscode.window.showWarningMessage(e.message)));
        await Promise.all(process);
    }

    async addWordsToCustomDictionary(words: string[], dict: CustomDictionaryWithPath): Promise<void> {
        try {
            const data = await fs.readFile(dict.path, defaultEncoding).catch(() => '');
            const lines = unique(data.split(/\r?\n/g).concat(words))
                .filter((a) => !!a)
                .sort();
            return fs.writeFile(dict.path, lines.join('\n') + '\n');
        } catch (e) {
            return Promise.reject(new Error(`Failed to add words to "${dict.name}" [${dict.path}]`));
        }
    }
}

function isDictionaryWithPath(dict: DictionaryDefinition | CustomDictionaryWithPath | undefined): dict is CustomDictionaryWithPath {
    return !!(dict?.name && dict?.path);
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}
