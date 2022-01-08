import { CancellationToken, ConfigurationTarget, QuickPickItem, QuickPickOptions, Uri, window } from 'vscode';
import { ClientConfigTarget } from './clientConfigTarget';
import {
    _buildQuickPickBestMatchTargetFn,
    createClientConfigTargetCSpell,
    createClientConfigTargetDictionary,
    createClientConfigTargetVSCode,
    createConfigTargetMatchPattern,
    dictionaryTargetBestMatches,
    dictionaryTargetBestMatchesCSpell,
    doesTargetMatchPattern,
    filterClientConfigTargets,
    findBestMatchingConfigTargets,
    matchKindAll,
    matchKindCSpell,
    matchKindNone,
    matchKindVSCode,
    matchKindDictionary,
    matchScopeAll,
    matchScopeAllButUser,
    matchScopeFolder,
    matchScopeNone,
    matchScopeUser,
    matchScopeWorkspace,
    negatePattern,
    quickPickBestMatchTarget,
    buildQuickPickMatchTargetFn,
} from './configTargetHelper';

const dirUri = Uri.file(__dirname);
const fileUri = Uri.file(__filename);

const mockedShowQuickPick = jest.mocked(window.showQuickPick);
type MockedShowQuickPick = typeof mockedShowQuickPick;

const ctDictA = createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/words1.txt'), 'unknown');
const ctDictB = createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/words2.txt'), 'unknown', 'more-words');
const ctCspell = createClientConfigTargetCSpell(Uri.joinPath(dirUri, '../../cspell.json'), 'unknown');
const ctVSCodeF = createClientConfigTargetVSCode(ConfigurationTarget.WorkspaceFolder, fileUri, undefined);
const ctVSCodeW = createClientConfigTargetVSCode(ConfigurationTarget.Workspace, fileUri, undefined);
const ctDictU = createClientConfigTargetDictionary(Uri.joinPath(dirUri, 'a/user-words.txt'), 'user', 'my-words');
const ctVSCodeU = createClientConfigTargetVSCode(ConfigurationTarget.Global, fileUri, undefined);

describe('configTargetHelper', () => {
    beforeEach(() => {
        mockedShowQuickPick.mockClear();
    });

    test('findMatchingConfigTargets all', () => {
        const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeAll);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findBestMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[0], targets[1]]);
    });

    test('findMatchingConfigTargets user', () => {
        const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeUser);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findBestMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[5]]);
    });

    test('findMatchingConfigTargets cspell', () => {
        const pattern = createConfigTargetMatchPattern(matchKindCSpell, matchScopeAll);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findBestMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[2]]);
    });

    test('findMatchingConfigTargets vscode', () => {
        const pattern = createConfigTargetMatchPattern(matchKindVSCode, matchScopeWorkspace);
        const targets = sampleTargets();
        // Dictionaries are the best match
        const r = findBestMatchingConfigTargets(pattern, targets);
        expect(r).toEqual([targets[4]]);
    });

    test('buildMatchTargetFn best dictionary', async () => {
        setQuickPickSelection(mockedShowQuickPick, 1);
        const targets = sampleTargets();
        const r = await dictionaryTargetBestMatches(targets);
        expect(r).toEqual([targets[1]]);
    });

    test('buildMatchTargetFn best dictionary', async () => {
        setQuickPickSelection(mockedShowQuickPick, 1);
        const targets = sampleTargets();
        const r = await dictionaryTargetBestMatchesCSpell(targets);
        expect(r).toEqual([targets[2]]);
    });

    test('buildMatchTargetFn best dictionary user canceled quickPick', async () => {
        mockedShowQuickPick.mockImplementation(async () => undefined);
        const targets = sampleTargets();
        const r = await dictionaryTargetBestMatches(targets);
        expect(r).toBeUndefined();
    });

    test('buildMatchTargetFn best no match', async () => {
        mockedShowQuickPick.mockImplementation(async () => undefined);
        const targets = sampleTargets();
        const fn = await _buildQuickPickBestMatchTargetFn(matchKindNone, matchScopeNone);
        await expect(() => fn(targets)).rejects.toEqual(new Error('No matching configuration found.'));
    });

    test('quickPickBestMatchTarget', async () => {
        setQuickPickSelection(mockedShowQuickPick, 1);
        const targets = sampleTargets();
        const pattern = createConfigTargetMatchPattern(matchKindAll, matchScopeAllButUser);
        const r = await quickPickBestMatchTarget(targets, pattern);
        expect(r).toEqual([targets[1]]);
    });

    test('buildQuickPickMatchTargetFn', async () => {
        setQuickPickSelection(mockedShowQuickPick, 1);
        const targets = sampleTargets();
        const pattern = createConfigTargetMatchPattern('cspell', matchScopeAll);
        const fn = buildQuickPickMatchTargetFn(pattern);
        const r = await fn(targets);
        expect(r).toEqual([ctCspell]);
        expect(mockedShowQuickPick).toHaveBeenCalledTimes(0);
    });

    test.each`
        patterns                                                            | expected
        ${[matchKindAll, matchScopeAll]}                                    | ${[{ cspell: false, dictionary: false, folder: false, unknown: false, user: false, vscode: false, workspace: false }]}
        ${[matchKindCSpell, matchScopeUser]}                                | ${[{ cspell: false, user: false }]}
        ${[matchKindNone, matchKindCSpell, matchScopeNone, matchScopeUser]} | ${[{ cspell: false, dictionary: true, folder: true, unknown: true, user: false, vscode: true, workspace: true }]}
    `('negatePattern $patterns', ({ patterns, expected }) => {
        const p = createConfigTargetMatchPattern(...patterns);
        const e = createConfigTargetMatchPattern(...expected);
        expect(negatePattern(p)).toEqual(e);
    });

    test.each`
        target       | kind               | scope               | expected
        ${ctCspell}  | ${matchKindCSpell} | ${matchScopeAll}    | ${true}
        ${ctDictU}   | ${matchKindAll}    | ${matchScopeUser}   | ${true}
        ${ctVSCodeF} | ${matchKindAll}    | ${matchScopeUser}   | ${false}
        ${ctVSCodeF} | ${matchKindAll}    | ${matchScopeFolder} | ${true}
    `('doesTargetMatchPattern', ({ target, kind, scope, expected }) => {
        const pattern = createConfigTargetMatchPattern(kind, scope);
        expect(doesTargetMatchPattern(target, pattern)).toBe(expected);
    });

    test.each`
        targets                         | patterns                                | expected
        ${[ctCspell]}                   | ${[matchKindCSpell, matchScopeAll]}     | ${[ctCspell]}
        ${[ctCspell, ctDictA, ctDictB]} | ${[matchKindCSpell, matchScopeAll]}     | ${[ctCspell]}
        ${[ctCspell, ctDictA, ctDictB]} | ${[matchKindCSpell]}                    | ${[]}
        ${[ctCspell, ctDictA, ctDictU]} | ${[matchKindAll, matchScopeUser]}       | ${[ctDictU]}
        ${[ctCspell, ctDictA, ctDictB]} | ${[matchKindDictionary, matchScopeAll]} | ${[ctDictA, ctDictB]}
    `('filterClientConfigTargets', ({ targets, patterns, expected }) => {
        const pattern = createConfigTargetMatchPattern(...patterns);
        expect(filterClientConfigTargets(targets, pattern)).toEqual(expected);
        const fn = (t: ClientConfigTarget) => doesTargetMatchPattern(t, pattern);
        expect(filterClientConfigTargets(targets, fn)).toEqual(expected);
    });
});

function setQuickPickSelection(mock: MockedShowQuickPick, selected: undefined | number | number[]) {
    const qp = new QuickPickImpl(selected);
    mock.mockImplementation((...p) => qp.showQuickPick(...p));
}

class QuickPickImpl {
    selected: undefined | number | number[] = [];

    constructor(selected: undefined | number | number[]) {
        this.selected = selected;
    }

    setSelect(selected: undefined | number | number[]) {
        this.selected = selected;
    }

    showQuickPick(
        items: readonly string[] | Thenable<readonly string[]>,
        options: QuickPickOptions & { canPickMany: true },
        token?: CancellationToken
    ): Thenable<string[] | undefined>;
    showQuickPick(
        items: readonly string[] | Thenable<readonly string[]>,
        options?: QuickPickOptions,
        token?: CancellationToken
    ): Thenable<string | undefined>;
    showQuickPick<T extends QuickPickItem>(
        items: readonly T[] | Thenable<readonly T[]>,
        options: QuickPickOptions & { canPickMany: true },
        token?: CancellationToken
    ): Thenable<T[] | undefined>;
    showQuickPick<T extends QuickPickItem>(
        items: readonly T[] | Thenable<readonly T[]>,
        options?: QuickPickOptions,
        token?: CancellationToken
    ): Thenable<T | undefined>;
    async showQuickPick<T extends QuickPickItem>(
        items: readonly T[] | Thenable<readonly T[]>,
        options?: QuickPickOptions,
        _token?: CancellationToken
    ): Promise<T | T[] | undefined> {
        const { canPickMany = false } = options || {};
        const list = await items;
        if (this.selected === undefined) return undefined;
        const indexes = typeof this.selected === 'number' ? [this.selected] : this.selected;
        const values = indexes.map((idx) => list[idx]);
        return canPickMany ? values : values[0];
    }
}

function sampleTargets(): ClientConfigTarget[] {
    return [ctDictA, ctDictB, ctCspell, ctVSCodeF, ctVSCodeW, ctDictU, ctVSCodeU];
}
