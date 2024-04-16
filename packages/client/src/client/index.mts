export * from './client.mjs';
export { DocumentConfigCache } from './DocumentConfigCache.mjs';
export type {
    ClientSideCommandHandlerApi,
    ConfigKind,
    ConfigScope,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
    CSpellUserSettings,
    CustomDictionaries,
    CustomDictionary,
    CustomDictionaryEntry,
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionCustom,
    NamedPattern,
    PatternMatch,
    SpellCheckerDiagnosticData,
    SpellCheckerSettingsProperties,
} from './server/index.js';
export { normalizeLocale } from './server/index.js';
