import { Uri } from 'vscode';

export type DictionaryTargetInfo =
    | DictionaryTargetInfoUser
    | DictionaryTargetInfoWorkspace
    | DictionaryTargetInfoFolder
    | DictionaryTargetInfoCSpellConfig
    | DictionaryTargetInfoDictionary;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TargetInfoType {
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

export type DictionaryTargetInfoTypes = DictionaryTargetInfo['type'];

export function isDictionaryTargetInfoTypes(t: DictionaryTargetInfoTypes | unknown): t is DictionaryTargetInfoTypes {
    return typeof t === 'string' && !!isTargetTypeMap[t];
}

type __IsTargetTypeMap = {
    [key in DictionaryTargetInfoTypes]: true;
};

interface IsTargetTypeMap extends __IsTargetTypeMap, Record<string, boolean | undefined> {}

const isTargetTypeMap: IsTargetTypeMap = {
    [TargetInfoType.User]: true,
    [TargetInfoType.Workspace]: true,
    [TargetInfoType.Folder]: true,
    [TargetInfoType.CSpell]: true,
    [TargetInfoType.Dictionary]: true,
};

export interface DictionaryTargetInfoUser {
    type: TargetInfoType.User;
    docUri: Uri | undefined;
}

export interface DictionaryTargetInfoWorkspace {
    type: TargetInfoType.Workspace;
    docUri: Uri | undefined;
}

export interface DictionaryTargetInfoFolder {
    type: TargetInfoType.Folder;
    docUri: Uri;
}

export interface DictionaryTargetInfoCSpellConfig {
    type: TargetInfoType.CSpell;
    docUri: Uri | undefined;
    name: string;
    uri: Uri;
}

export interface DictionaryTargetInfoDictionary {
    type: TargetInfoType.Dictionary;
    docUri: Uri | undefined;
    name: string;
    uri: Uri;
}

function isA<T extends DictionaryTargetInfo>(type: T['type']) {
    return (t: T | DictionaryTargetInfo): t is T => typeof t === 'object' && t.type === type;
}

export const isDictionaryTargetInfoUser = isA<DictionaryTargetInfoUser>(TargetInfoType.User);
export const isDictionaryTargetInfoWorkspace = isA<DictionaryTargetInfoWorkspace>(TargetInfoType.Workspace);
export const isDictionaryTargetInfoFolder = isA<DictionaryTargetInfoFolder>(TargetInfoType.Folder);
export const isDictionaryTargetInfoCSpellConfig = isA<DictionaryTargetInfoCSpellConfig>(TargetInfoType.CSpell);
export const isDictionaryTargetInfoDictionary = isA<DictionaryTargetInfoDictionary>(TargetInfoType.Dictionary);
