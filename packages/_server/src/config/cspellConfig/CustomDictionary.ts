import type {
    CustomDictionaryScope,
    DictionaryDefinitionCustom,
    DictionaryDefinitionPreferred,
    DictionaryId,
    FsPath,
} from '@cspell/cspell-types';
import type { EnableCustomDictionary } from './annotatedTypes';

type DictionaryDefPreferred = Omit<DictionaryDefinitionPreferred, 'type' | 'useCompounds' | 'repMap'>;

type DictionaryDefCustom = Omit<DictionaryDefinitionCustom, 'type' | 'useCompounds' | 'repMap'>;

export type DictionaryDef = DictionaryDefPreferred | DictionaryDefCustom;

export type CustomDictionaries = {
    [Name in DictionaryId]: EnableCustomDictionary | CustomDictionariesDictionary;
};

export type CustomDictionaryEntry = CustomDictionaryAugmentExistingDictionary | CustomDictionary | DictionaryId;
type OptionalField<T, K extends keyof T> = {
    [k in K]?: T[k];
} & Omit<T, K>;
/**
 * @title Custom Dictionary Entry
 * @markdownDescription
 * Define a custom dictionary to be included.
 */

export type CustomDictionariesDictionary = OptionalField<CustomDictionaryAugmentExistingDictionary | CustomDictionary, 'name'>;
interface CustomDictionaryBase extends Pick<DictionaryDefCustom, 'noSuggest'> {
    /**
     * @title Name of Dictionary
     * @markdownDescription
     * The reference name of the dictionary.
     *
     *
     * Example: `My Words` or `custom`
     *
     *
     * If they name matches a pre-defined dictionary, it will override the pre-defined dictionary.
     * If you use: `typescript` it will replace the built-in TypeScript dictionary.
     */
    name: DictionaryId;

    /**
     * @title Description of the Dictionary
     * @markdownDescription
     * Optional: A human readable description.
     */
    description?: string;

    /**
     * @title Path to Dictionary Text File
     * @markdownDescription
     * Define the path to the dictionary text file.
     *
     *
     * **Note:** if path is `undefined` the `name`d dictionary is expected to be found
     * in the `dictionaryDefinitions`.
     *
     *
     * File Format: Each line in the file is considered a dictionary entry.
     *
     *
     * Case is preserved while leading and trailing space is removed.
     *
     *
     * The path should be absolute, or relative to the workspace.
     *
     *
     * **Example:** relative to User's folder
     *
     * ```
     * ~/dictionaries/custom_dictionary.txt
     * ```
     *
     *
     * **Example:** relative to the `client` folder in a multi-root workspace
     *
     * ```
     * ${workspaceFolder:client}/build/custom_dictionary.txt
     * ```
     *
     *
     * **Example:** relative to the current workspace folder in a single-root workspace
     *
     * **Note:** this might no as expected in a multi-root workspace since it is based upon the relative
     * workspace for the currently open file.
     *
     * ```
     * ${workspaceFolder}/build/custom_dictionary.txt
     * ```
     *
     *
     * **Example:** relative to the workspace folder in a single-root workspace or the first folder in
     * a multi-root workspace
     *
     * ```
     * ./build/custom_dictionary.txt
     * ```
     */
    path?: FsPath;

    /**
     * @title Add Words to Dictionary
     * @markdownDescription
     * Indicate if this custom dictionary should be used to store added words.
     * @default true
     */
    addWords?: boolean;

    /**
     * @title Scope of dictionary
     * @markdownDescription
     * Options are
     * - `user` - words that apply to all projects and workspaces
     * - `workspace` - words that apply to the entire workspace
     * - `folder` - words that apply to only a workspace folder
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
