import { uriToName } from 'common-utils/uriHelper.js';
import { pick } from 'common-utils/util.js';
import { ConfigurationScope, ConfigurationTarget, Uri } from 'vscode';
import { CSpellUserSettings, CustomDictionaryScope } from '../server';
import { ConfigKeysByField } from './configFields';
import { updateConfigFile } from './configFileReadWrite';
import { configurationTargetToDictionaryScope } from './targetAndScope';
import { configurationTargetToName, updateConfig } from './vsConfig';

type ConfigKeys = keyof CSpellUserSettings;

export type ConfigRepositoryKind = 'cspell' | 'vscode';

/** Interface for a location where CSpell configuration is stored */
export interface ConfigRepository {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: CustomDictionaryScope | undefined;
    /**
     * @param updateFn - a function that will return the updated config fields
     * @param neededKeys - a list of fields needed by `updateFn`.
     *   This is needed to retrieve config from VS Code.
     */
    readonly update: (updateFn: ConfigUpdateFn, neededKeys: readonly ConfigKeys[]) => Promise<void>;
    readonly setValue: <K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]) => Promise<void>;
    readonly updateValue: <K extends ConfigKeys>(key: K, value: CSpellUserSettings[K] | UpdateConfigFieldFn<K>) => Promise<void>;
}

/**
 * Configuration Update function that returns only the fields that need to be updated.
 */
export type ConfigUpdateFn = (cfg: Partial<CSpellUserSettings>) => Partial<CSpellUserSettings>;

export type UpdateConfigFieldFn<K extends keyof CSpellUserSettings> = (value: CSpellUserSettings[K]) => CSpellUserSettings[K];

abstract class ConfigRepositoryBase implements ConfigRepository {
    abstract readonly name: string;
    abstract readonly kind: ConfigRepositoryKind;
    abstract readonly defaultDictionaryScope: CustomDictionaryScope | undefined;

    abstract update(fn: ConfigUpdateFn, _neededKeys: readonly ConfigKeys[]): Promise<void>;

    setValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K]): Promise<void> {
        return this.update(() => ({ [key]: value }), []);
    }

    updateValue<K extends ConfigKeys>(key: K, value: CSpellUserSettings[K] | UpdateConfigFieldFn<K>): Promise<void> {
        return this.update(updateConfigByKeyFn(key, value), [key]);
    }
}
export class CSpellConfigRepository extends ConfigRepositoryBase {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: undefined;

    constructor(readonly configFileUri: Uri, name?: string | undefined) {
        super();
        this.name = name || uriToName(configFileUri);
        this.kind = 'cspell';
    }

    update(fn: ConfigUpdateFn, neededKeys: readonly ConfigKeys[]): Promise<void> {
        return updateConfigFile(this.configFileUri, fnUpdateFilterKeys(fn, neededKeys));
    }
}

export class VSCodeRepository extends ConfigRepositoryBase {
    readonly name: string;
    readonly kind: ConfigRepositoryKind;
    readonly defaultDictionaryScope: CustomDictionaryScope;

    constructor(readonly target: ConfigurationTarget, readonly scope: ConfigurationScope) {
        super();
        this.name = configurationTargetToName(target);
        this.defaultDictionaryScope = configurationTargetToDictionaryScope(target);
        this.kind = 'vscode';
    }

    update(updateFn: ConfigUpdateFn, neededKeys: readonly ConfigKeys[]): Promise<void> {
        const { fn, keys } = this.mappers(neededKeys, updateFn);

        return updateConfig(this.target, this.scope, keys, fn);
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

export function updateConfigByKeyFn<K extends keyof CSpellUserSettings>(
    key: K,
    updateFnOrValue: CSpellUserSettings[K] | UpdateConfigFieldFn<K>
): (cfg: CSpellUserSettings) => CSpellUserSettings {
    if (typeof updateFnOrValue === 'function') {
        return (cfg) => ({
            [key]: updateFnOrValue(cfg[key]),
        });
    }

    return () => ({ [key]: updateFnOrValue });
}

function fnUpdateFilterKeys(fn: ConfigUpdateFn, keys: readonly ConfigKeys[]): ConfigUpdateFn {
    return (cfg) => fn(pick(cfg, keys));
}
