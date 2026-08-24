export type { EnabledFileTypes, EnabledSchemes } from '../config/cspellConfig/FileTypesAndSchemeSettings.mjs';
export { ConfigFields } from '../config/cspellConfig/index.mjs';
export {
    extractEnabledFileTypes,
    extractEnabledSchemeList,
    extractEnabledSchemes,
    extractKnownFileTypeIds,
    getDefaultEnabledSchemesSettings,
    isSchemeEnabled,
    schemeWildcard,
} from '../config/extractEnabledFileTypes.mjs';
