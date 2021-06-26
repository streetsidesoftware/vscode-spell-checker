import { Uri } from 'vscode';

export type DictionaryTargets =
    | DictionaryTargetUser
    | DictionaryTargetWorkspace
    | DictionaryTargetFolder
    | DictionaryTargetCSpellConfig
    | DictionaryTargetDictionary;

export type DictionaryTargetTypes = DictionaryTargets['type'];

export interface DictionaryTargetUser {
    type: 'user';
}

export interface DictionaryTargetWorkspace {
    type: 'workspace';
}

export interface DictionaryTargetFolder {
    type: 'folder';
    docUri: Uri;
}

export interface DictionaryTargetCSpellConfig {
    type: 'cspell';
    name: string;
    uri: Uri;
}

export interface DictionaryTargetDictionary {
    type: 'dictionary';
    name: string;
    uri: Uri;
}

function isA<T extends DictionaryTargets>(type: T['type']) {
    return (t: T | DictionaryTargets): t is T => typeof t === 'object' && t.type === type;
}

export const isDictionaryTargetUser = isA<DictionaryTargetUser>('user');
export const isDictionaryTargetWorkspace = isA<DictionaryTargetWorkspace>('workspace');
export const isDictionaryTargetFolder = isA<DictionaryTargetFolder>('folder');
export const isDictionaryTargetCSpellConfig = isA<DictionaryTargetCSpellConfig>('cspell');
export const isDictionaryTargetDictionary = isA<DictionaryTargetDictionary>('dictionary');
