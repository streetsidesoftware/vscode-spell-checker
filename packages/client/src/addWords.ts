import type { Uri } from 'vscode';

import * as di from './di';
import type { MatchTargetsFn } from './settings/configTargetHelper';
import {
    dictionaryTargetBestMatchesFolder,
    dictionaryTargetBestMatchesUser,
    dictionaryTargetBestMatchesWorkspace,
} from './settings/configTargetHelper';
import { handleErrors } from './util/errors';
import { toUri } from './util/uriHelper';

export function addWordToFolderDictionary(word: string, docUri: string | null | Uri | undefined): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchesFolder, docUri);
}

export function addWordToWorkspaceDictionary(word: string, docUri: string | null | Uri | undefined): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchesWorkspace, docUri);
}

export function addWordToUserDictionary(word: string): Promise<void> {
    return addWordToTarget(word, dictionaryTargetBestMatchesUser, undefined);
}

export function addWordToTarget(word: string, target: MatchTargetsFn, docUri: string | null | Uri | undefined) {
    return handleErrors(_addWordToTarget(word, target, docUri), 'addWordToTarget');
}

function _addWordToTarget(word: string, target: MatchTargetsFn, docUri: string | null | Uri | undefined) {
    docUri = toUri(docUri);
    return di.get('dictionaryHelper').addWordsToTargets(word, target, docUri);
}

export function fnWTarget<TT>(
    fn: (word: string, t: TT, uri: Uri | undefined) => Promise<void>,
    t: TT,
): (word: string, uri: Uri | undefined) => Promise<void> {
    return (word, uri) => fn(word, t, uri);
}
