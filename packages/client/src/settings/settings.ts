import { CSpellSettings } from '@cspell/cspell-types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri, workspace } from 'vscode';
import { CSpellUserSettings, normalizeLocale as normalizeLocale } from '../client';
import { isDefined, unique } from '../util';
import * as watcher from '../util/watcher';
import { ClientConfigScope, ClientConfigTarget, orderScope } from './clientConfigTarget';
import { readConfigFile, writeConfigFile } from './configFileReadWrite';
import { applyUpdateToConfigTargets, readFromConfigTargets } from './configRepositoryHelper';
import {
    ConfigTargetMatchPattern,
    filterClientConfigTargets,
    patternMatchNoDictionaries,
    quickPickBestMatchTarget,
    quickPickTarget,
    quickPickTargets,
} from './configTargetHelper';
import { configUpdaterForKey } from './configUpdater';
import { configFileLocations, isUpdateSupportedForConfigFileFormat, normalizeWords, preferredConfigFiles } from './CSpellSettings';
export { ConfigTargetLegacy, InspectScope, Scope } from './vsConfig';
export interface SettingsInfo {
    path: Uri;
    settings: CSpellUserSettings;
}

export function watchSettingsFiles(callback: () => void): vscode.Disposable {
    // Every 10 seconds see if we have new files to watch.
    let busy = false;
    const intervalObj = setInterval(async () => {
        if (busy) {
            return;
        }
        busy = true;
        const settingsFiles = await findSettingsFiles();
        settingsFiles
            .map((uri) => uri.fsPath)
            .filter((file) => !watcher.isWatching(file))
            .forEach((file) => watcher.add(file, callback));
        busy = false;
    }, 10000);

    return vscode.Disposable.from({
        dispose: () => {
            watcher.dispose();
            clearInterval(intervalObj);
        },
    });
}

function getDefaultWorkspaceConfigLocation(docUri?: Uri): vscode.WorkspaceFolder | undefined {
    const defaultFolderUri = docUri && vscode.workspace.getWorkspaceFolder(docUri);
    return defaultFolderUri || workspace.workspaceFolders?.[0];
}

export function hasWorkspaceLocation(): boolean {
    return !!workspace.workspaceFile || !!workspace.workspaceFolders?.[0];
}

/**
 * Returns a list of files in the order of Best to Worst Match.
 * @param docUri
 */
function findSettingsFiles(docUri?: Uri, isUpdatable?: boolean): Promise<Uri[]> {
    const { workspaceFolders } = workspace;
    if (!workspaceFolders || !hasWorkspaceLocation()) {
        return Promise.resolve([]);
    }

    const folders = docUri ? [workspace.getWorkspaceFolder(docUri)].filter(isDefined).concat(workspaceFolders) : workspaceFolders;

    const possibleLocations = folders
        .map((folder) => folder.uri.fsPath)
        .map((root) => configFileLocations.map((rel) => path.join(root, rel)))
        .reduce((a, b) => a.concat(b), []);

    const found = possibleLocations.map(async (filename) => ({ filename, exists: await fs.pathExists(filename) }));

    return Promise.all(found).then((found) =>
        found
            .filter((found) => found.exists)
            .map((found) => found.filename)
            .map((filename) => Uri.file(filename))
            .filter((uri) => !isUpdatable || isUpdateSupportedForConfigFileFormat(uri))
    );
}

export function setEnableSpellChecking(targets: ClientConfigTarget[], enabled: boolean): Promise<void> {
    return setConfigFieldQuickPick(targets, 'enabled', enabled);
}

/**
 * @description Enable a programming language
 * @param target - which level of setting to set
 * @param languageId - the language id, e.g. 'typescript'
 */
export async function enableLanguageId(targets: ClientConfigTarget[], languageId: string): Promise<void> {
    await enableLanguageIdForTarget(languageId, true, targets);
}

export async function disableLanguageId(targets: ClientConfigTarget[], languageId: string): Promise<void> {
    await enableLanguageIdForTarget(languageId, false, targets);
}

export function addIgnoreWordsToSettings(targets: ClientConfigTarget[], words: string | string[]): Promise<void> {
    const addWords = normalizeWords(words);
    return setConfigFieldQuickPick(targets, 'ignoreWords', (words) => unique(addWords.concat(words || []).sort()));
}

export function toggleEnableSpellChecker(targets: ClientConfigTarget[]): Promise<void> {
    return setConfigFieldQuickPick(targets, 'enabled', (enabled) => !enabled);
}

export async function setConfigFieldQuickPickBestTarget<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>
): Promise<void> {
    const t = await quickPickBestMatchTarget(targets, patternMatchNoDictionaries);
    if (!t || !t.length) return;
    return applyToConfig(t, key, value);
}

async function setConfigFieldQuickPick<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>
) {
    const t = await quickPickTargets(targets);
    if (!t || !t.length) return;
    return applyToConfig(t, key, value);
}

type ApplyValueOrFn<K extends keyof CSpellUserSettings> = CSpellUserSettings[K] | ((v: CSpellUserSettings[K]) => CSpellUserSettings[K]);

function applyToConfig<K extends keyof CSpellUserSettings>(
    targets: ClientConfigTarget[],
    key: K,
    value: ApplyValueOrFn<K>,
    filter?: ConfigTargetMatchPattern
) {
    targets = filter ? filterClientConfigTargets(targets, filter) : targets;
    const updater = configUpdaterForKey<K>(key, value);
    return applyUpdateToConfigTargets(updater, targets);
}

function readConfigTargetValues<K extends keyof CSpellUserSettings>(targets: ClientConfigTarget[], key: K) {
    return readFromConfigTargets(key, targets);
}

export function enableLocale(targets: ClientConfigTarget[], locale: string, possibleScopes: ClientConfigScope[]): Promise<void> {
    return enableLocaleForTarget(locale, true, targets, possibleScopes);
}

export function disableLocale(targets: ClientConfigTarget[], locale: string, possibleScopes: ClientConfigScope[]): Promise<void> {
    return enableLocaleForTarget(locale, false, targets, possibleScopes);
}

/**
 * Try to add or remove a locale from the nearest configuration.
 * Present the user with the option to pick a target if more than one viable target is available.
 *
 * @param locale - locale to add or remove
 * @param enable - true = add
 * @param targets - all known targets
 * @param possibleScopes - possible scopes
 * @returns resolves when finished - rejects if an error was encountered.
 */
export async function enableLocaleForTarget(
    locale: string,
    enable: boolean,
    targets: ClientConfigTarget[],
    possibleScopes: ClientConfigScope[]
): Promise<void> {
    // Have targets inherit values.
    targets = targets.map((t) => ({ ...t, useMerge: t.useMerge ?? t.kind === 'vscode' }));

    const allowedScopes = new Set(orderScope(possibleScopes));
    const orderedTargets = new Set(orderTargetsLocalToGlobal(targets));
    const mapTargetsToValue = new Map(await readConfigTargetValues([...orderedTargets], 'language'));
    const possibleTargets = new Set([...orderedTargets].filter((t) => allowedScopes.has(t.scope)));

    if (!enable) {
        // remove all non-overlapping targets.
        [...mapTargetsToValue].filter(([_, v]) => !doLocalesIntersect(locale, v.language)).forEach(([t]) => possibleTargets.delete(t));
    } else {
        const keep = [...possibleTargets];
        const targetsWithLocale = new Set([...mapTargetsToValue].filter(([_, v]) => isLocaleSubsetOf(locale, v.language)).map(([t]) => t));
        let clear = false;
        for (const t of possibleTargets) {
            clear = clear || targetsWithLocale.has(t);
            if (clear) possibleTargets.delete(t);
        }
        // If nothing is left, let the user pick from any of the possible set.
        if (!possibleTargets.size) {
            // Add back any that have not already been set.
            keep.filter((t) => !targetsWithLocale.has(t)).forEach((t) => possibleTargets.add(t));
        }
    }

    const t = possibleTargets.size > 1 ? await quickPickTarget([...possibleTargets]) : [...possibleTargets][0];
    if (!t) return;

    const defaultValue = calcInheritedDefault('language', t, mapTargetsToValue);

    const applyFn: (src: string | undefined) => string | undefined = enable
        ? (currentLanguage) => addLocaleToCurrentLocale(locale, currentLanguage || defaultValue)
        : (currentLanguage) => removeLocaleFromCurrentLocale(locale, currentLanguage);

    return applyToConfig([t], 'language', applyFn);
}

function orderTargetsLocalToGlobal(targets: ClientConfigTarget[]): ClientConfigTarget[] {
    const scopes = targets.map((t) => t.scope);
    const orderedScopes = orderScope(scopes, true);
    const orderedTargets: ClientConfigTarget[] = [];
    orderedScopes.map((scope) => targets.filter((t) => t.scope === scope)).forEach((t) => t.forEach((t) => orderedTargets.push(t)));
    return orderedTargets;
}

/**
 * It is a two step logic to minimize a build up of values in the configuration.
 * The idea is to use defaults whenever possible.
 * @param languageId The language id / filetype to enable / disable
 * @param enable true == enable / false == disable
 * @param currentValues the value to update.
 */
function updateEnableFiletypes(languageId: string, enable: boolean, currentValues: string[] | undefined) {
    const values = new Set(currentValues || []);
    const disabledLangId = '!' + languageId;
    if (enable) {
        if (values.has(disabledLangId)) {
            values.delete(disabledLangId);
        } else {
            values.add(languageId);
        }
    } else {
        if (values.has(languageId)) {
            values.delete(languageId);
        } else {
            values.add(disabledLangId);
        }
    }

    // values.delete(languageId);
    // values.delete(disabledLangId);
    // values.add(enable ? languageId : disabledLangId);
    return values.size ? [...values].sort() : undefined;
}

export function enableLanguageIdForTarget(languageId: string, enable: boolean, targets: ClientConfigTarget[]): Promise<void> {
    const fn = (src: string[] | undefined) => updateEnableFiletypes(languageId, enable, src);
    return setConfigFieldQuickPick(targets, 'enableFiletypes', fn);
}

const settingsFileTemplate: CSpellSettings = {
    version: '0.2',
    ignorePaths: [],
    dictionaryDefinitions: [],
    dictionaries: [],
    words: [],
    ignoreWords: [],
    import: [],
};

export async function createConfigFile(fileUri: Uri, overwrite?: boolean): Promise<Uri | undefined> {
    if (!overwrite && (await readConfigFile(fileUri, undefined))) {
        const overwrite = 'Overwrite';
        const choice = await vscode.window.showWarningMessage('Configuration file already exists.', { modal: true }, overwrite);
        if (choice !== overwrite) {
            return undefined;
        }
    }

    await writeConfigFile(fileUri, settingsFileTemplate);

    return fileUri;
}

async function directoryHasPackageJson(dir: vscode.Uri): Promise<boolean> {
    const uri = Uri.joinPath(dir, 'package.json');
    try {
        const stat = await workspace.fs.stat(uri);
        return stat.type === vscode.FileType.File;
    } catch (e) {
        return false;
    }
}

function folderHasPackageJson(folder: vscode.WorkspaceFolder): Promise<boolean> {
    return directoryHasPackageJson(folder.uri);
}

const msgNoPossibleConfigLocation = 'Unable to determine location for configuration file.';

export async function createConfigFileRelativeToDocumentUri(referenceDocUri?: Uri, overwrite?: boolean): Promise<Uri | undefined> {
    const folder = getDefaultWorkspaceConfigLocation(referenceDocUri);

    if (!folder) throw new Error(msgNoPossibleConfigLocation);
    if (folder.uri.scheme !== 'file') throw new Error(`Unsupported scheme: ${folder.uri.scheme}`);

    const optionalFiles = new Set(preferredConfigFiles);

    if (!(await folderHasPackageJson(folder))) optionalFiles.delete('package.json');

    const choice = await vscode.window.showQuickPick([...optionalFiles], { title: 'Choose config file' });
    if (!choice) return;

    const configFile = Uri.joinPath(folder.uri, choice);
    await createConfigFile(configFile, overwrite);
    return configFile;
}

function normalize(locale: string) {
    return normalizeLocale(locale)
        .split(',')
        .filter((a) => !!a);
}

function addLocaleToCurrentLocale(locale: string, currentLocale: string | undefined): string | undefined {
    const toAdd = normalize(locale);
    const currentSet = new Set(normalize(currentLocale || ''));

    toAdd.forEach((locale) => currentSet.add(locale));

    return [...currentSet].join(',') || undefined;
}

function removeLocaleFromCurrentLocale(locale: string, currentLocale: string | undefined): string | undefined {
    const toRemove = normalize(locale);
    const currentSet = new Set(normalize(currentLocale || ''));

    toRemove.forEach((locale) => currentSet.delete(locale));

    return [...currentSet].join(',') || undefined;
}

function doLocalesIntersect(localeA: string, localeB: string): boolean;
function doLocalesIntersect(localeA: string, localeB: undefined): false;
function doLocalesIntersect(localeA: string, localeB: string | undefined): boolean;
function doLocalesIntersect(localeA: string, localeB: string | undefined): boolean {
    if (!localeA || !localeB) return false;

    const a = new Set(normalize(localeA));
    const b = normalize(localeB);
    for (const locale of b) {
        if (a.has(locale)) return true;
    }
    return false;
}

function isLocaleSubsetOf(localeA: string, localeB: string): boolean;
function isLocaleSubsetOf(localeA: string, localeB: undefined): false;
function isLocaleSubsetOf(localeA: string, localeB: string | undefined): boolean;
function isLocaleSubsetOf(localeA: string, localeB: string | undefined): boolean {
    if (!localeA || !localeB) return false;

    const largerSet = new Set(normalize(localeB));
    const smallerSet = normalize(localeA);
    for (const locale of smallerSet) {
        if (!largerSet.has(locale)) return false;
    }
    return true;
}

function calcInheritedDefault<K extends keyof CSpellUserSettings>(
    key: K,
    target: ClientConfigTarget,
    targetsWithValue: Iterable<[ClientConfigTarget, CSpellUserSettings]>
): CSpellUserSettings[K] {
    const tv = [...targetsWithValue].reverse();
    let value: CSpellUserSettings[K] = undefined;
    for (const [t, v] of tv) {
        value = v[key] ?? value;
        if (t === target) break;
    }
    return value;
}

export const __testing__ = {
    addLocaleToCurrentLocale,
    removeLocaleFromCurrentLocale,
    doLocalesIntersect,
    isLocaleSubsetOf,
};
