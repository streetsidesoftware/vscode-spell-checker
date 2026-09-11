export type { EnabledFileTypes, EnabledSchemes } from '../config/cspellConfig/FileTypesAndSchemeSettings.mjs';
export type { CSpellUserAndExtensionSettings } from '../config/cspellConfig/index.mjs';
export { configDefaults, ConfigFields } from '../config/cspellConfig/index.mjs';
export {
    extractEnabledFileTypes,
    extractEnabledSchemeList,
    extractEnabledSchemes,
    extractKnownFileTypeIds,
    getDefaultEnabledSchemesSettings,
    isSchemeEnabled,
    schemeWildcard,
} from '../config/extractEnabledFileTypes.mjs';
