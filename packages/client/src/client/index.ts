export * from './client';
export { DocumentConfigCache } from './DocumentConfigCache';
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
} from './server';
export { normalizeLocale } from './server';
