import { Uri } from 'vscode';
import {
    DictionaryTargetInfoCSpellConfig,
    DictionaryTargetInfoDictionary,
    DictionaryTargetInfoFolder,
    DictionaryTargetInfoUser,
    DictionaryTargetInfoWorkspace,
    isDictionaryTargetInfoCSpellConfig,
    isDictionaryTargetInfoDictionary,
    isDictionaryTargetInfoFolder,
    isDictionaryTargetInfoUser,
    isDictionaryTargetInfoWorkspace,
} from './DictionaryTargetInfo';

describe('Validate DictionaryTargets', () => {
    const uri = Uri.file(__filename);
    const tUser: DictionaryTargetInfoUser = { type: 'user', docUri: undefined };
    const tWorkspace: DictionaryTargetInfoWorkspace = { type: 'workspace', docUri: undefined };
    const tFolder: DictionaryTargetInfoFolder = { type: 'folder', docUri: uri };
    const tCSpellConfig: DictionaryTargetInfoCSpellConfig = { type: 'cspell', docUri: undefined, name: 'cspell.json', uri };
    const tDictionary: DictionaryTargetInfoDictionary = { type: 'dictionary', docUri: undefined, name: 'custom-words', uri };

    test.each`
        target           | method                                | expected
        ${tUser}         | ${isDictionaryTargetInfoUser}         | ${true}
        ${tWorkspace}    | ${isDictionaryTargetInfoWorkspace}    | ${true}
        ${tFolder}       | ${isDictionaryTargetInfoFolder}       | ${true}
        ${tCSpellConfig} | ${isDictionaryTargetInfoCSpellConfig} | ${true}
        ${tDictionary}   | ${isDictionaryTargetInfoDictionary}   | ${true}
        ${tDictionary}   | ${isDictionaryTargetInfoUser}         | ${false}
        ${tUser}         | ${isDictionaryTargetInfoWorkspace}    | ${false}
        ${tWorkspace}    | ${isDictionaryTargetInfoFolder}       | ${false}
        ${tFolder}       | ${isDictionaryTargetInfoCSpellConfig} | ${false}
        ${tCSpellConfig} | ${isDictionaryTargetInfoDictionary}   | ${false}
        ${{}}            | ${isDictionaryTargetInfoDictionary}   | ${false}
        ${5}             | ${isDictionaryTargetInfoDictionary}   | ${false}
        ${'hello'}       | ${isDictionaryTargetInfoDictionary}   | ${false}
    `('$target $expected', ({ target, method, expected }) => {
        expect(method(target)).toBe(expected);
    });
});
