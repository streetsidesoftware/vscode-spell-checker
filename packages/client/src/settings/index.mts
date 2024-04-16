export { ConfigFields } from './configFields.mjs';
export { configFileLocationGlob, configFilesToWatch, CSpellSettings } from './CSpellSettings.mjs';
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
} from './settings.mjs';
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
} from './vsConfig.mjs';
