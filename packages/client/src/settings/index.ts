export { ConfigFields } from './configFields';
export { configFileLocationGlob, configFilesToWatch, CSpellSettings } from './CSpellSettings';
export {
    addIgnoreWordsToSettings,
    ConfigTargetLegacy,
    createConfigFileRelativeToDocumentUri,
    disableLanguageId,
    enableLanguageId,
    enableLanguageIdForTarget,
    enableLocaleForTarget,
    setEnableSpellChecking,
    TargetsAndScopes,
    toggleEnableSpellChecker,
} from './settings';
export {
    ConfigurationTarget,
    getScopedSettingFromVSConfig,
    getSettingFromVSConfig,
    getSettingsFromVSConfig,
    Inspect,
    inspectConfig,
    inspectConfigKeys,
    InspectValues,
    normalizeTarget,
    Scopes,
    sectionCSpell,
} from './vsConfig';
