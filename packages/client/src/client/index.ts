export * from './client';
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
    GetConfigurationForDocumentResult,
    NamedPattern,
    PatternMatch,
    SpellCheckerDiagnosticData,
    SpellCheckerSettingsProperties,
} from './server';
export { normalizeLocale } from './server';
