import type { EnabledFileTypes, EnabledSchemes } from './cspellConfig/FileTypesAndSchemeSettings.mjs';
import type { CSpellUserAndExtensionSettings } from './cspellConfig/index.mjs';

const schemeBlockList: EnabledSchemes = {
    git: false, // blocked by default
    output: false, // blocked by default - output channel
    debug: false, // blocked by default - debug console
} as const;

const defaultAllowedSchemes: EnabledSchemes = {
    gist: true,
    repo: true,
    file: true,
    sftp: true,
    untitled: true,
    'vscode-notebook-cell': true,
    'vscode-vfs': true, // Visual Studio Remote File System
    vsls: true, // Visual Studio Live Share
    ...schemeBlockList,
} as const;

const defaultCheckOnlyEnabledFileTypes = true;

function reduceExtractEnabledSchemes(schemes: EnabledSchemes, settings: CSpellUserAndExtensionSettings): EnabledSchemes {
    if (settings.allowedSchemas) {
        const changes = Object.fromEntries(settings.allowedSchemas.map((schema) => [schema, true]));
        schemes = { ...schemes, ...changes };
    }
    if (settings.enabledSchemes) {
        schemes = { ...schemes, ...settings.enabledSchemes };
    }

    return schemes;
}

export function extractEnabledSchemes(...settings: CSpellUserAndExtensionSettings[]): EnabledSchemes {
    const schemes: Record<string, boolean> = {
        ...defaultAllowedSchemes,
    };

    return settings.reduce(reduceExtractEnabledSchemes, schemes);
}

export function extractEnabledSchemeList(...settings: CSpellUserAndExtensionSettings[]): string[] {
    const schemes = extractEnabledSchemes(...settings);
    return Object.entries(schemes)
        .filter(([, enabled]) => enabled)
        .map(([schema]) => schema);
}

export function applyEnabledSchemes(
    settings: CSpellUserAndExtensionSettings,
    enabledSchemes: EnabledSchemes = {},
): CSpellUserAndExtensionSettings {
    enabledSchemes = extractEnabledSchemes(settings, enabledSchemes);
    const { allowedSchemas: _, ...rest } = settings;
    return { ...rest, enabledSchemes };
}

function reduceLangIdsToEnabledFileTypes(filetypes: EnabledFileTypes, enabledLanguageIds: string[] | undefined): EnabledFileTypes {
    if (!enabledLanguageIds) return filetypes;
    const changes = Object.fromEntries(
        normalizeEnableFiletypes(enabledLanguageIds).map((lang) => (lang.startsWith('!') ? [lang.slice(1), false] : [lang, true])),
    );
    filetypes = { ...filetypes, ...changes };
    return filetypes;
}

function reduceEnabledFileTypes(filetypes: EnabledFileTypes, changes: EnabledFileTypes | undefined): EnabledFileTypes {
    return changes ? { ...filetypes, ...changes } : filetypes;
}

function reduceEnabledFileTypesInSettings(filetypes: EnabledFileTypes, settings: CSpellUserAndExtensionSettings): EnabledFileTypes {
    filetypes = reduceLangIdsToEnabledFileTypes(filetypes, settings.enabledLanguageIds);
    filetypes = reduceLangIdsToEnabledFileTypes(filetypes, settings.enableFiletypes);
    filetypes = reduceEnabledFileTypes(filetypes, settings.enabledFileTypes);
    return filetypes;
}

export function extractEnabledFileTypes(
    settings: CSpellUserAndExtensionSettings,
    enabledFileTypes: EnabledFileTypes = {},
): EnabledFileTypes {
    return reduceEnabledFileTypesInSettings(enabledFileTypes, settings);
}

export function extractKnownFileTypeIds(settings: CSpellUserAndExtensionSettings): string[] {
    return Object.keys(extractEnabledFileTypes(settings)).sort();
}

export function applyEnabledFileTypes(
    settings: CSpellUserAndExtensionSettings,
    enabledFileTypes: EnabledFileTypes = {},
): CSpellUserAndExtensionSettings {
    enabledFileTypes = reduceEnabledFileTypesInSettings(enabledFileTypes, settings);
    const { enableFiletypes: _, enabledLanguageIds: __, ...rest } = settings;
    return { ...rest, enabledFileTypes };
}

export function normalizeEnableFiletypes(enableFiletypes: string[]): string[] {
    const ids = enableFiletypes
        .map((id) => id.replace(/!/g, '~')) // Use ~ for better sorting
        .sort()
        .map((id) => id.replace(/~/g, '!')) // Restore the !
        .map((id) => id.replace(/^(!!)+/, '')); // Remove extra !! pairs

    return ids;
}

export function isFileTypeEnabled(languageId: string, settings: CSpellUserAndExtensionSettings): boolean {
    const enabledFileTypes = extractEnabledFileTypes(settings);
    const enabled = enabledFileTypes[languageId];
    if (enabled !== undefined) return enabled;
    const starEnabled = enabledFileTypes['*'];
    if (starEnabled) return true;
    const checkOnly = settings.checkOnlyEnabledFileTypes ?? defaultCheckOnlyEnabledFileTypes;
    return !checkOnly;
}
