export { ConfigFields } from './configFields.mjs';
export type { CSpellSettings } from './CSpellSettings.mjs';
export { configFileLocationGlob, configFilesToWatch } from './CSpellSettings.mjs';
export type { ConfigTargetLegacy, TargetsAndScopes } from './settings.mjs';
export {
    addIgnoreWordsToSettings,
    createConfigFileRelativeToDocumentUri,
    enableLocaleForTarget,
    setEnableSpellChecking,
    toggleEnableSpellChecker,
    updateEnabledFileTypeForResource,
    updateEnabledFileTypeForTarget,
} from './settings.mjs';
export type { Inspect, InspectValues } from './vsConfig.mjs';
export {
    ConfigurationTarget,
    getScopedSettingFromVSConfig,
    getSettingFromVSConfig,
    getSettingsFromVSConfig,
    inspectConfig,
    inspectConfigKeys,
    normalizeTarget,
    Scopes,
    sectionCSpell,
} from './vsConfig.mjs';
