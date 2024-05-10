import type { EnabledFileTypes, EnabledSchemes } from './cspellConfig/FileTypesAndSchemeSettings.mjs';
import type { CSpellUserSettings } from './cspellConfig/index.mjs';

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

function reduceExtractEnabledSchemes(schemes: EnabledSchemes, settings: CSpellUserSettings): EnabledSchemes {
    if (settings.allowedSchemas) {
        const changes = Object.fromEntries(settings.allowedSchemas.map((schema) => [schema, true]));
        schemes = { ...schemes, ...changes };
    }
    if (settings.enabledSchemes) {
        schemes = { ...schemes, ...settings.enabledSchemes };
    }

    return schemes;
}

export function extractEnabledSchemes(...settings: CSpellUserSettings[]): EnabledSchemes {
    const schemes: Record<string, boolean> = {
        ...defaultAllowedSchemes,
    };

    return settings.reduce(reduceExtractEnabledSchemes, schemes);
}

export function extractEnabledSchemeList(...settings: CSpellUserSettings[]): string[] {
    const schemes = extractEnabledSchemes(...settings);
    return Object.entries(schemes)
        .filter(([, enabled]) => enabled)
        .map(([schema]) => schema);
}

export function applyEnabledSchemes(settings: CSpellUserSettings, enabledSchemes: EnabledSchemes = {}): CSpellUserSettings {
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

function reduceEnabledFileTypesInSettings(filetypes: EnabledFileTypes, settings: CSpellUserSettings): EnabledFileTypes {
    filetypes = reduceLangIdsToEnabledFileTypes(filetypes, settings.enabledLanguageIds);
    filetypes = reduceLangIdsToEnabledFileTypes(filetypes, settings.enableFiletypes);
    filetypes = reduceEnabledFileTypes(filetypes, settings.enabledFileTypes);
    return filetypes;
}

export function extractEnabledFileTypes(settings: CSpellUserSettings, enabledFileTypes: EnabledFileTypes = {}): EnabledFileTypes {
    return reduceEnabledFileTypesInSettings(enabledFileTypes, settings);
}

export function extractKnownFileTypeIds(settings: CSpellUserSettings): string[] {
    return Object.keys(extractEnabledFileTypes(settings)).sort();
}

export function applyEnabledFileTypes(settings: CSpellUserSettings, enabledFileTypes: EnabledFileTypes = {}): CSpellUserSettings {
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

export function isLanguageEnabled(languageId: string, settings: CSpellUserSettings): boolean {
    const enabledFileTypes = extractEnabledFileTypes(settings);
    const enabled = enabledFileTypes[languageId];
    if (enabled !== undefined) return enabled;
    const starEnabled = enabledFileTypes['*'];
    if (starEnabled) return true;
    const checkOnly = settings.checkOnlyEnabledFileTypes ?? defaultCheckOnlyEnabledFileTypes;
    return !checkOnly;
}
