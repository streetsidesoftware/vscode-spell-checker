import { capitalize } from '@internal/common-utils/util';
import { describe, expect, test } from 'vitest';

import type {
    ConfigKind,
    ConfigScope,
    ConfigScopeVScode,
    ConfigTarget,
    ConfigTargetCSpell,
    ConfigTargetDictionary,
    ConfigTargetVSCode,
} from './configTargets.mjs';
import {
    ConfigKinds,
    ConfigScopes,
    isConfigTargetCSpell,
    isConfigTargetDictionary,
    isConfigTargetOfKind,
    isConfigTargetVSCode,
    weight,
} from './configTargets.mjs';

describe('Validate ConfigTarget', () => {
    const targetDict = t(ConfigKinds.Dictionary, ConfigScopes.Unknown);
    const targetCSpell = t(ConfigKinds.Cspell, ConfigScopes.Unknown);
    const targetVSCode = t(ConfigKinds.Vscode, ConfigScopes.Unknown);

    test.each`
        target          | kind                      | expected
        ${{}}           | ${ConfigKinds.Dictionary} | ${false}
        ${{}}           | ${ConfigKinds.Cspell}     | ${false}
        ${{}}           | ${ConfigKinds.Vscode}     | ${false}
        ${targetDict}   | ${ConfigKinds.Dictionary} | ${true}
        ${targetDict}   | ${ConfigKinds.Cspell}     | ${false}
        ${targetDict}   | ${ConfigKinds.Vscode}     | ${false}
        ${targetCSpell} | ${ConfigKinds.Dictionary} | ${false}
        ${targetCSpell} | ${ConfigKinds.Cspell}     | ${true}
        ${targetCSpell} | ${ConfigKinds.Vscode}     | ${false}
        ${targetVSCode} | ${ConfigKinds.Dictionary} | ${false}
        ${targetVSCode} | ${ConfigKinds.Cspell}     | ${false}
        ${targetVSCode} | ${ConfigKinds.Vscode}     | ${true}
    `('isA $kind $target ', ({ target, expected, kind }) => {
        const isA = fnIsA(kind);
        expect(isA(target)).toBe(expected);
    });

    test.each`
        target          | kind                      | expected
        ${{}}           | ${ConfigKinds.Dictionary} | ${false}
        ${{}}           | ${ConfigKinds.Cspell}     | ${false}
        ${{}}           | ${ConfigKinds.Vscode}     | ${false}
        ${targetDict}   | ${ConfigKinds.Dictionary} | ${true}
        ${targetDict}   | ${ConfigKinds.Cspell}     | ${false}
        ${targetDict}   | ${ConfigKinds.Vscode}     | ${false}
        ${targetCSpell} | ${ConfigKinds.Dictionary} | ${false}
        ${targetCSpell} | ${ConfigKinds.Cspell}     | ${true}
        ${targetCSpell} | ${ConfigKinds.Vscode}     | ${false}
        ${targetVSCode} | ${ConfigKinds.Dictionary} | ${false}
        ${targetVSCode} | ${ConfigKinds.Cspell}     | ${false}
        ${targetVSCode} | ${ConfigKinds.Vscode}     | ${true}
    `('isConfigTargetOfKind $kind $target ', ({ target, expected, kind }) => {
        expect(isConfigTargetOfKind(target, kind)).toBe(expected);
    });

    test.each`
        kindA                     | scopeA                  | kindB                     | scopeB                  | comment
        ${ConfigKinds.Dictionary} | ${ConfigScopes.Unknown} | ${ConfigKinds.Vscode}     | ${ConfigScopes.User}    | ${'User scope is lowest'}
        ${ConfigKinds.Dictionary} | ${ConfigScopes.User}    | ${ConfigKinds.Vscode}     | ${ConfigScopes.User}    | ${'User scope is lowest'}
        ${ConfigKinds.Dictionary} | ${ConfigScopes.Folder}  | ${ConfigKinds.Dictionary} | ${ConfigScopes.User}    | ${'User scope is lowest'}
        ${ConfigKinds.Vscode}     | ${ConfigScopes.Folder}  | ${ConfigKinds.Dictionary} | ${ConfigScopes.User}    | ${'User scope is lowest'}
        ${ConfigKinds.Cspell}     | ${ConfigScopes.Unknown} | ${ConfigKinds.Dictionary} | ${ConfigScopes.User}    | ${'User scope is lowest'}
        ${ConfigKinds.Dictionary} | ${ConfigScopes.Folder}  | ${ConfigKinds.Cspell}     | ${ConfigScopes.Unknown} | ${'Prefer dictionary over cspell'}
    `('weight of $kindA/$scopeA is greater than $kindB/$scopeB', ({ kindA, scopeA, kindB, scopeB }) => {
        const a = t(kindA, scopeA);
        const b = t(kindB, scopeB);
        expect(weight(a)).toBeGreaterThan(weight(b));
    });

    test.each`
        kind
        ${ConfigKinds.Dictionary}
        ${ConfigKinds.Vscode}
        ${ConfigKinds.Cspell}
    `('weight of $kind vs scope is correct', ({ kind }) => {
        expect(weight(t(kind, ConfigScopes.Unknown))).toBeGreaterThanOrEqual(weight(t(kind, ConfigScopes.Folder)));
        expect(weight(t(kind, ConfigScopes.Folder))).toBeGreaterThan(weight(t(kind, ConfigScopes.Workspace)));
        expect(weight(t(kind, ConfigScopes.Workspace))).toBeGreaterThan(weight(t(kind, ConfigScopes.User)));
    });

    test.each`
        scope
        ${ConfigScopes.Unknown}
        ${ConfigScopes.Folder}
        ${ConfigScopes.Workspace}
        ${ConfigScopes.User}
    `('weight of $scope vs kind is correct', ({ scope }) => {
        expect(weight(t(ConfigKinds.Dictionary, scope))).toBeGreaterThan(weight(t(ConfigKinds.Cspell, scope)));
        expect(weight(t(ConfigKinds.Cspell, scope))).toBeGreaterThan(weight(t(ConfigKinds.Vscode, scope)));
    });
});

function t(kind: 'vscode', scope: ConfigScopeVScode): ConfigTarget;
function t(kind: ConfigKind, scope: ConfigScope): ConfigTarget;
function t(kind: ConfigKind, scope: ConfigScope): ConfigTarget {
    switch (kind) {
        case ConfigKinds.Dictionary:
            return tDict(scope);
        case ConfigKinds.Cspell:
            return tCspell(scope);
        case ConfigKinds.Vscode:
            return tVSCode(scope as ConfigScopeVScode);
    }
}

function fnIsA(kind: ConfigKind): (t: ConfigTarget) => boolean {
    switch (kind) {
        case ConfigKinds.Dictionary:
            return isConfigTargetDictionary;
        case ConfigKinds.Cspell:
            return isConfigTargetCSpell;
        case ConfigKinds.Vscode:
            return isConfigTargetVSCode;
    }
}

function tDict(scope: ConfigScope): ConfigTargetDictionary {
    return {
        kind: 'dictionary',
        scope,
        name: 'Custom Words',
        dictionaryUri: '',
    };
}

function tCspell(scope: ConfigScope, words = true, ignoreWords = false, index = 0): ConfigTargetCSpell {
    return {
        kind: 'cspell',
        scope,
        name: 'Custom Words',
        configUri: '',
        has: { words, ignoreWords },
        sortKey: index,
    };
}

function tVSCode(scope: ConfigScopeVScode, words = true, ignoreWords = false): ConfigTargetVSCode {
    return {
        kind: 'vscode',
        scope,
        name: capitalize(scope),
        docUri: '',
        folderUri: undefined,
        has: { words, ignoreWords },
    };
}
