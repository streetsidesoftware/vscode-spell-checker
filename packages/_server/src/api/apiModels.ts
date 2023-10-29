import type { PublishDiagnosticsParams } from 'vscode-languageserver';

import type { ConfigScopeVScode, ConfigTarget } from '../config/configTargets.mjs';
import type * as config from '../config/cspellConfig/index.mjs';
import type { Suggestion } from './models/Suggestion.mjs';
import type { ExtensionId } from './models/types.mjs';

export type {
    ConfigKind,
    ConfigScope,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
} from '../config/configTargets.mjs';
export type { Position, Range } from 'vscode-languageserver-types';

export interface BlockedFileReason {
    code: string;
    message: string;
    documentationRefUri?: UriString;
}

export type UriString = string;
export type DocumentUri = UriString;

export type StartIndex = number;
export type EndIndex = number;

export type RangeTuple = [StartIndex, EndIndex];

export interface ExcludeRef {
    glob: string;
    id: string | undefined;
    name: string | undefined;
    configUri: string | undefined;
}

export interface GitignoreInfo {
    gitIgnoreFile: string;
    glob: string | undefined;
    line: number | undefined;
    matched: boolean;
    root: string | undefined;
}

export interface IsSpellCheckEnabledResult {
    /** The Uri used to determine the settings. */
    uriUsed: string | undefined;
    workspaceFolderUri: string | undefined;
    languageEnabled: boolean | undefined;
    languageId: string | undefined;
    fileEnabled: boolean;
    fileIsIncluded: boolean;
    fileIsExcluded: boolean;
    excludedBy: ExcludeRef[] | undefined;
    gitignored: boolean | undefined;
    gitignoreInfo: GitignoreInfo | undefined;
    blockedReason: BlockedFileReason | undefined;
}

export interface SplitTextIntoWordsResult {
    words: string[];
}

export interface SpellingSuggestionsResult {
    suggestions: Suggestion[];
}

export interface GetConfigurationForDocumentRequest extends Partial<TextDocumentInfo> {
    /** used to calculate configTargets, configTargets will be empty if undefined. */
    workspaceConfig?: WorkspaceConfigForDocument;
}

export interface GetConfigurationForDocumentResult extends IsSpellCheckEnabledResult {
    settings: config.CSpellUserSettings | undefined;
    docSettings: config.CSpellUserSettings | undefined;
    configFiles: UriString[];
    configTargets: ConfigTarget[];
}

export interface TextDocumentRef {
    readonly uri: DocumentUri;
}

export interface TextDocumentInfo extends TextDocumentRef {
    readonly languageId?: string;
    readonly text?: string;
    readonly version?: number;
}

export interface TextDocumentInfoWithText extends TextDocumentInfo {
    readonly text: string;
}

export interface NamedPattern {
    name: string;
    pattern: string | string[];
}

export interface MatchPatternsToDocumentRequest extends TextDocumentRef {
    readonly patterns: (string | NamedPattern)[];
}

export interface RegExpMatch {
    regexp: string;
    matches: RangeTuple[];
    elapsedTime: number;
    errorMessage?: string;
}

export type RegExpMatchResults = RegExpMatch;

export interface PatternMatch {
    name: string;
    defs: RegExpMatch[];
}

export interface MatchPatternsToDocumentResult {
    uri: UriString;
    version: number;
    patternMatches: PatternMatch[];
    message?: string;
}

export interface OnSpellCheckDocumentStep extends NotificationInfo {
    /**
     * uri of the text document
     */
    uri: DocumentUri;

    /**
     *
     */
    version: number;

    /**
     * name of step.
     */
    step: string;

    /**
     * Number of issues found
     */
    numIssues?: number;

    /**
     * true if it is finished
     */
    done?: boolean;
}

export interface NotificationInfo {
    /**
     * Sequence number.
     * Notifications can be sorted based upon the sequence number to give the order
     * in which the Notification was generated.
     * It should be unique between Notifications of the same type.
     */
    seq: number;

    /**
     * timestamp in ms.
     */
    ts: number;
}

export interface WorkspaceConfigForDocumentRequest {
    uri: DocumentUri;
}

export interface WorkspaceConfigForDocument {
    uri: DocumentUri | undefined;
    workspaceFile: UriString | undefined;
    workspaceFolder: UriString | undefined;
    words: FieldExistsInTarget;
    ignoreWords: FieldExistsInTarget;
}

export interface WorkspaceConfigForDocumentResponse extends WorkspaceConfigForDocument {}

export type FieldExistsInTarget = {
    [key in ConfigurationTarget]?: boolean;
};

export type ConfigurationTarget = ConfigScopeVScode;

export type {
    CSpellUserSettings,
    CustomDictionaries,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    CustomDictionaryWithScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    DictionaryFileTypes,
    LanguageSetting,
    SpellCheckerSettings,
    SpellCheckerSettingsProperties,
} from '../config/cspellConfig/index.mjs';

export type VSCodeSettingsCspell = {
    [key in ExtensionId]?: config.CSpellUserSettings;
};

export type PublishDiagnostics = Required<PublishDiagnosticsParams>;
