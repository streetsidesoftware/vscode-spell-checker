import { CSpellSettings } from '@cspell/cspell-types';
import * as vscode from 'vscode';
import { Uri, workspace } from 'vscode';
import { CSpellUserSettings } from '../client';
import { unique } from '../util';
import { ClientConfigTarget } from './clientConfigTarget';
import { readConfigFile, writeConfigFile } from './configFileReadWrite';
import { normalizeWords, preferredConfigFiles } from './CSpellSettings';
import { setConfigFieldQuickPick } from './settings.base';

export { setEnableSpellChecking, toggleEnableSpellChecker } from './settings.enable';
export { enableLocaleForTarget } from './settings.locale';
export type { TargetsAndScopes } from './settings.types';
export { ConfigTargetLegacy, InspectScope, Scope } from './vsConfig';
export interface SettingsInfo {
    path: Uri;
    settings: CSpellUserSettings;
}

function getDefaultWorkspaceConfigLocation(docUri?: Uri): vscode.WorkspaceFolder | undefined {
    const defaultFolderUri = docUri && vscode.workspace.getWorkspaceFolder(docUri);
    return defaultFolderUri || workspace.workspaceFolders?.[0];
}

export function hasWorkspaceLocation(): boolean {
    return !!workspace.workspaceFile || !!workspace.workspaceFolders?.[0];
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
