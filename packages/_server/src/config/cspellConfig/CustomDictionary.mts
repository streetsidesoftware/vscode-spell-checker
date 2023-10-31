import type {
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
    DictionaryId,
    FsPath,
} from '@cspell/cspell-types';

import type { EnableCustomDictionary } from './annotatedTypes.mjs';

type DictionaryDefPreferred = Omit<DictionaryDefinitionPreferred, 'type' | 'useCompounds' | 'repMap'>;

type DictionaryDefCustom = Omit<DictionaryDefinitionCustom, 'type' | 'useCompounds' | 'repMap'>;

export type DictionaryDef = CustomDictionary | DictionaryDefPreferred | DictionaryDefCustom;

export type CustomDictionaries = {
    [Name in DictionaryId]: EnableCustomDictionary | CustomDictionariesDictionary;
};

export type CustomDictionaryEntry = CustomDictionaryAugmentExistingDictionary | CustomDictionary | DictionaryId;
type OptionalField<T, K extends keyof T> = {
    [k in K]?: T[k];
} & Omit<T, K>;

/**
 * Define a custom dictionary to be included.
 * @title Custom Dictionary Entry
 */
export type CustomDictionariesDictionary = OptionalField<CustomDictionaryAugmentExistingDictionary | CustomDictionary, 'name'>;

interface CustomDictionaryBase extends Pick<DictionaryDefCustom, 'noSuggest'> {
    /**
     * The reference name of the dictionary.
     *
     *
     * Example: `My Words` or `custom`
     *
     *
     * If the name matches a pre-defined dictionary, it will override the pre-defined dictionary.
     * If you use: `typescript` it will replace the built-in TypeScript dictionary.
     * @title Name of Dictionary
     */
    name: DictionaryId;

    /**
     * Optional: A human readable description.
     * @title Description of the Dictionary
     */
    description?: string;

    /**
     * Define the path to the dictionary text file.
     *
     * **Note:** if path is `undefined` the `name`d dictionary is expected to be found
     * in the `dictionaryDefinitions`.
     *
     * File Format: Each line in the file is considered a dictionary entry.
     *
     * Case is preserved while leading and trailing space is removed.
     *
     * The path should be absolute, or relative to the workspace.
     *
     * **Example:** relative to User's folder
     *
     * ```json
     * "path": "~/dictionaries/custom_dictionary.txt"
     * ```
     *
     * **Example:** relative to the `client` folder in a multi-root workspace
     *
     * ```json
     * "path": "${workspaceFolder:client}/build/custom_dictionary.txt"
     * ```
     *
     * **Example:** relative to the current workspace folder in a single-root workspace
     *
     * **Note:** this might not work as expected in a multi-root workspace since it is based upon the relative
     * workspace for the currently open file.
     *
     * ```json
     * "path": "${workspaceFolder}/build/custom_dictionary.txt"
     * ```
     *
     * **Example:** relative to the workspace folder in a single-root workspace or the first folder in
     * a multi-root workspace
     *
     * ```json
     * "path": "./build/custom_dictionary.txt"
     * ```
     * @title Path to Dictionary Text File
     */
    path?: FsPath;

    /**
     * Indicate if this custom dictionary should be used to store added words.
     * @title Add Words to Dictionary
     * @default true
     */
    addWords?: boolean;

    /**
     * Options are
     * - `user` - words that apply to all projects and workspaces
     * - `workspace` - words that apply to the entire workspace
     * - `folder` - words that apply to only a workspace folder
     * @title Scope of dictionary
     */
    scope?: CustomDictionaryScope | CustomDictionaryScope[];
}

export interface CustomDictionaryAugmentExistingDictionary extends CustomDictionaryBase {
    /**
     * @hidden
     */
    path?: FsPath;
    /**
     * @hidden
     */
    noSuggest?: undefined;
}

export interface CustomDictionary extends CustomDictionaryBase, Omit<DictionaryDefCustom, keyof CustomDictionaryBase> {
    path: FsPath;
}

export interface CustomDictionaryWithScope extends CustomDictionary {}
