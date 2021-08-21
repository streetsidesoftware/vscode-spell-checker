import { CSpellSettings } from '@cspell/cspell-types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri, workspace } from 'vscode';
import { CSpellUserSettings, normalizeLocale as normalizeLocale } from '../server';
import { isDefined, unique } from '../util';
import * as watcher from '../util/watcher';
import { ClientConfigTarget } from './clientConfigTarget';
import { readConfigFile, writeConfigFile } from './configFileReadWrite';
import { applyUpdateToConfigTargets } from './configRepositoryHelper';
import {
    ConfigTargetMatchPattern,
    filterClientConfigTargets,
    patternMatchNoDictionaries,
    quickPickBestMatchTarget,
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

export function enableLocale(targets: ClientConfigTarget[], locale: string): Promise<void> {
    return enableLocaleForTarget(locale, true, targets);
}

export function disableLocale(targets: ClientConfigTarget[], locale: string): Promise<void> {
    return enableLocaleForTarget(locale, false, targets);
}

export function enableLocaleForTarget(locale: string, enable: boolean, targets: ClientConfigTarget[]): Promise<void> {
    const applyFn: (src: string | undefined) => string | undefined = enable
        ? (currentLanguage) =>
              unique(
                  normalizeLocale(currentLanguage || 'en')
                      .split(',')
                      .concat(locale.split(','))
              )
                  .filter((a) => !!a)
                  .join(',')
        : (currentLanguage) => {
              const value = unique(normalizeLocale(currentLanguage).split(','))
                  .filter((lang) => lang !== locale)
                  .join(',');
              return value || undefined;
          };
    return setConfigFieldQuickPick(targets, 'language', applyFn);
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
