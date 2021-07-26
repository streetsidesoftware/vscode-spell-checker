import { mocked } from 'ts-jest/utils';
import { ConfigurationTarget, Uri, window } from 'vscode';
import { ClientConfigTarget } from './clientConfigTarget';
import {
    buildMatchTargetFn,
    createClientConfigTargetCSpell,
    createClientConfigTargetDictionary,
    createClientConfigTargetVSCode,
    createConfigTargetMatchPattern,
    dictionaryTargetBestMatch,
    dictionaryTargetCSpell,
    findMatchingConfigTargets,
    matchKindAll,
    matchKindCSpell,
    matchKindNone,
    matchKindVSCode,
    matchScopeAll,
    matchScopeNone,
    matchScopeUser,
    matchScopeWorkspace,
} from './configTargetHelper';

const dirUri = Uri.file(__dirname);
const fileUri = Uri.file(__filename);

const mockedShowQuickPick = mocked(window.showQuickPick);

describe('configTargetHelper', () => {
    test('findMatchingConfigTargets all', () => {
        const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeAll);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[0], targets[1]]);
    });

    test('findMatchingConfigTargets user', () => {
        const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeUser);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[5]]);
    });

    test('findMatchingConfigTargets cspell', () => {
        const pattern = createConfigTargetMatchPattern(matchKindCSpell, matchScopeAll);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[2]]);
    });

    test('findMatchingConfigTargets vscode', () => {
        const pattern = createConfigTargetMatchPattern(matchKindVSCode, matchScopeWorkspace);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[4]]);
    });

    test('buildMatchTargetFn best dictionary', async () => {
        mockedShowQuickPick.mockImplementation(async (items) => (await items)[1]);
        const targets = sampleTargets();
        const r = await dictionaryTargetBestMatch(targets);
        expect(r).toEqual(targets[1]);
    });

    test('buildMatchTargetFn best dictionary', async () => {
        mockedShowQuickPick.mockImplementation(async (items) => (await items)[1]);
        const targets = sampleTargets();
        const r = await dictionaryTargetCSpell(targets);
        expect(r).toEqual(targets[2]);
    });

    test('buildMatchTargetFn best dictionary user canceled quickPick', async () => {
        mockedShowQuickPick.mockImplementation(async () => undefined);
        const targets = sampleTargets();
        const r = await dictionaryTargetBestMatch(targets);
        expect(r).toBeUndefined();
    });

    test('buildMatchTargetFn best no match', async () => {
        mockedShowQuickPick.mockImplementation(async () => undefined);
        const targets = sampleTargets();
        const fn = await buildMatchTargetFn(matchKindNone, matchScopeNone);
        await expect(() => fn(targets)).rejects.toEqual(new Error('No matching configuration found.'));
    });
});

function sampleTargets(): ClientConfigTarget[] {
    return [
        createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/words1.txt'), 'unknown'),
        createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/words2.txt'), 'unknown', 'more-words'),
        createClientConfigTargetCSpell(Uri.joinPath(dirUri, '../../cspell.json'), 'unknown'),
        createClientConfigTargetVSCode(ConfigurationTarget.WorkspaceFolder, fileUri),
        createClientConfigTargetVSCode(ConfigurationTarget.Workspace, fileUri),
        createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/user-words.txt'), 'user', 'my-words'),
        createClientConfigTargetVSCode(ConfigurationTarget.Global, fileUri),
    ];
}
