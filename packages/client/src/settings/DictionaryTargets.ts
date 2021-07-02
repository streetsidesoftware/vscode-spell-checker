import { Uri } from 'vscode';

export type DictionaryTargets =
    | DictionaryTargetUser
    | DictionaryTargetWorkspace
    | DictionaryTargetFolder
    | DictionaryTargetCSpellConfig
    | DictionaryTargetDictionary;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TargetType {
    export const User = 'user';
    export const Workspace = 'workspace';
    export const Folder = 'folder';
    export const CSpell = 'cspell';
    export const Dictionary = 'dictionary';

    export type User = typeof User;
    export type Workspace = typeof Workspace;
    export type Folder = typeof Folder;
    export type CSpell = typeof CSpell;
    export type Dictionary = typeof Dictionary;
}

export type DictionaryTargetTypes = DictionaryTargets['type'];

export function isDictionaryTargetTypes(t: DictionaryTargetTypes | unknown): t is DictionaryTargetTypes {
    return typeof t === 'string' && !!isTargetTypeMap[t];
}

type __IsTargetTypeMap = {
    [key in DictionaryTargetTypes]: true;
};

interface IsTargetTypeMap extends __IsTargetTypeMap, Record<string, boolean | undefined> {}

const isTargetTypeMap: IsTargetTypeMap = {
    [TargetType.User]: true,
    [TargetType.Workspace]: true,
    [TargetType.Folder]: true,
    [TargetType.CSpell]: true,
    [TargetType.Dictionary]: true,
};

export interface DictionaryTargetUser {
    type: TargetType.User;
    docUri: Uri | undefined;
}

export interface DictionaryTargetWorkspace {
    type: TargetType.Workspace;
    docUri: Uri | undefined;
}

export interface DictionaryTargetFolder {
    type: TargetType.Folder;
    docUri: Uri;
}

export interface DictionaryTargetCSpellConfig {
    type: TargetType.CSpell;
    docUri: Uri | undefined;
    name: string;
    uri: Uri;
}

export interface DictionaryTargetDictionary {
    type: TargetType.Dictionary;
    docUri: Uri | undefined;
    name: string;
    uri: Uri;
}

function isA<T extends DictionaryTargets>(type: T['type']) {
    return (t: T | DictionaryTargets): t is T => typeof t === 'object' && t.type === type;
}

export const isDictionaryTargetUser = isA<DictionaryTargetUser>(TargetType.User);
export const isDictionaryTargetWorkspace = isA<DictionaryTargetWorkspace>(TargetType.Workspace);
export const isDictionaryTargetFolder = isA<DictionaryTargetFolder>(TargetType.Folder);
export const isDictionaryTargetCSpellConfig = isA<DictionaryTargetCSpellConfig>(TargetType.CSpell);
export const isDictionaryTargetDictionary = isA<DictionaryTargetDictionary>(TargetType.Dictionary);
