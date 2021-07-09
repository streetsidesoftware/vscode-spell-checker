// import { mocked } from 'ts-jest/utils';
import { DictionaryHelper, __testing__ } from './DictionaryHelper';
import { CSpellClient } from '../client/client';
import { Uri } from 'vscode';

jest.mock('../client/client', () => {
    return {
        CSpellClient: jest.fn().mockImplementation(() => {
            return {
                getConfigurationForDocument: jest.fn(),
                notifySettingsChanged: () => Promise.resolve(),
            };
        }),
    };
});

//  const CSpellClientMock = mocked(CSpellClient);

const { isTextDocument } = __testing__;

describe('Validate DictionaryHelper', () => {
    test('isTextDocument', () => {
        const uri = Uri.file(__filename);
        expect(isTextDocument(uri)).toBe(false);
    });

    test('DictionaryHelper', () => {
        const client = new CSpellClient('', []);
        const helper = new DictionaryHelper(client);
        expect(helper).toBeDefined();
    });
});
