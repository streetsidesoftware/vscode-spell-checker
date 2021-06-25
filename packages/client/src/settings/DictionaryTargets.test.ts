import { Uri } from 'vscode';
import {
    DictionaryTargetCSpellConfig,
    DictionaryTargetDictionary,
    DictionaryTargetFolder,
    DictionaryTargetUser,
    DictionaryTargetWorkspace,
    isDictionaryTargetCSpellConfig,
    isDictionaryTargetDictionary,
    isDictionaryTargetFolder,
    isDictionaryTargetUser,
    isDictionaryTargetWorkspace,
} from './DictionaryTargets';

describe('Validate DictionaryTargets', () => {
    const uri = Uri.file(__filename);
    const tUser: DictionaryTargetUser = { type: 'user' };
    const tWorkspace: DictionaryTargetWorkspace = { type: 'workspace' };
    const tFolder: DictionaryTargetFolder = { type: 'folder', docUri: uri };
    const tCSpellConfig: DictionaryTargetCSpellConfig = { type: 'cspell', name: 'cspell.json', uri };
    const tDictionary: DictionaryTargetDictionary = { type: 'dictionary', name: 'custom-words', uri };

    test.each`
        target           | method                            | expected
        ${tUser}         | ${isDictionaryTargetUser}         | ${true}
        ${tWorkspace}    | ${isDictionaryTargetWorkspace}    | ${true}
        ${tFolder}       | ${isDictionaryTargetFolder}       | ${true}
        ${tCSpellConfig} | ${isDictionaryTargetCSpellConfig} | ${true}
        ${tDictionary}   | ${isDictionaryTargetDictionary}   | ${true}
        ${tDictionary}   | ${isDictionaryTargetUser}         | ${false}
        ${tUser}         | ${isDictionaryTargetWorkspace}    | ${false}
        ${tWorkspace}    | ${isDictionaryTargetFolder}       | ${false}
        ${tFolder}       | ${isDictionaryTargetCSpellConfig} | ${false}
        ${tCSpellConfig} | ${isDictionaryTargetDictionary}   | ${false}
        ${{}}            | ${isDictionaryTargetDictionary}   | ${false}
        ${5}             | ${isDictionaryTargetDictionary}   | ${false}
        ${'hello'}       | ${isDictionaryTargetDictionary}   | ${false}
    `('$target $expected', ({ target, method, expected }) => {
        expect(method(target)).toBe(expected);
    });
});
