import { CSpellUserSettings } from '../server';
import { uriToName } from 'common-utils/uriHelper.js';
import { ConfigurationScope, ConfigurationTarget, Uri } from 'vscode';
import { updateConfigFile } from './configFileReadWrite';
import { configurationTargetToName, updateConfig } from './vsConfig';
import { ConfigKeysByField } from './configFields';

type ConfigKeys = keyof CSpellUserSettings;

/** Interface for a location where CSpell configuration is stored */
export interface ConfigRepository {
    readonly name: string;
    /**
     * @param updateFn - a function that will return the updated config fields
     * @param neededKeys - a list of fields needed by `updateFn`.
     *   This is needed to retrieve config from VS Code.
     */
    readonly update: (updateFn: ConfigUpdateFn, neededKeys: readonly ConfigKeys[]) => Promise<void>;
    readonly setValue: <K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]) => Promise<void>;
}

/**
 * Configuration Update function that returns only the fields that need to be updated.
 */
export type ConfigUpdateFn = (cfg: Partial<CSpellUserSettings>) => Partial<CSpellUserSettings>;

export class CSpellConfigRepository implements ConfigRepository {
    readonly name: string;

    constructor(readonly configFileUri: Uri, name?: string | undefined) {
        this.name = name || uriToName(configFileUri);
    }

    update(fn: ConfigUpdateFn, _neededKeys: readonly ConfigKeys[]): Promise<void> {
        return updateConfigFile(this.configFileUri, fn);
    }

    setValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]): Promise<void> {
        return this.update(() => ({ [key]: value }), []);
    }
}

export class VSCodeRepository implements ConfigRepository {
    readonly name: string;

    constructor(readonly target: ConfigurationTarget, readonly scope: ConfigurationScope) {
        this.name = configurationTargetToName(target);
    }

    update(updateFn: ConfigUpdateFn, neededKeys: readonly ConfigKeys[]): Promise<void> {
        const { fn, keys } = this.mappers(neededKeys, updateFn);

        return updateConfig(this.target, this.scope, keys, fn);
    }

    setValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]): Promise<void> {
        return this.update(() => ({ [key]: value }), []);
    }

    /**
     * Remap `words` to `userWords` if necessary
     * @param neededKeys - keys needed for update
     * @param fn - update function
     * @returns A new set of keys and update function
     */
    private mappers(
        neededKeys: readonly ConfigKeys[],
        fn: ConfigUpdateFn
    ): {
        fn: ConfigUpdateFn;
        keys: readonly ConfigKeys[];
    } {
        if (this.target !== ConfigurationTarget.Global) return { fn, keys: neededKeys };

        const keys = new Set(neededKeys);
        if (keys.has(ConfigKeysByField.words)) {
            keys.delete(ConfigKeysByField.words);
            keys.add(ConfigKeysByField.userWords);
        }

        function userWordsToWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { userWords, words, ...rest } = cfg;
            const c: CSpellUserSettings = { ...rest };
            if (keys.has(ConfigKeysByField.userWords) || userWords || words) {
                c.words = userWords?.concat(words ?? []) ?? words;
            }
            return c;
        }

        function wordsToUserWords(cfg: CSpellUserSettings): CSpellUserSettings {
            const { words, userWords, ...cfgResult } = cfg;
            const r: CSpellUserSettings = { ...cfgResult };
            if (Object.keys(cfg).includes(ConfigKeysByField.words)) {
                r.words = undefined;
                r.userWords = words?.concat(userWords || []);
            }
            return r;
        }

        // Remap userWords => words => userWords
        const updateFn: ConfigUpdateFn = (cfg) => wordsToUserWords(fn(userWordsToWords(cfg)));

        return {
            fn: updateFn,
            keys: [...keys],
        };
    }
}
