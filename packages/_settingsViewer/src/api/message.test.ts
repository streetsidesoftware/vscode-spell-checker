import { sampleSettings } from '../test/samples/sampleSettings';
import {
    ConfigurationChangeMessage,
    EnableLocaleMessage,
    isConfigurationChangeMessage,
    isEnableLocaleMessage,
    isMessage,
    isSelectFileMessage,
    isSelectFolderMessage,
    SelectFileMessage,
    SelectFolderMessage,
} from './message';

describe('Validate Messages', () => {
    const msgSelectFolder: SelectFolderMessage = {
        command: 'SelectFolderMessage',
        value: '/',
    };
    const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
        command: 'ConfigurationChangeMessage',
        value: { settings: sampleSettings },
    };
    test.each`
        msg                                                       | expected
        ${{}}                                                     | ${false}
        ${5}                                                      | ${false}
        ${new Date()}                                             | ${false}
        ${null}                                                   | ${false}
        ${undefined}                                              | ${false}
        ${{ command: 'UpdateCounter' }}                           | ${false}
        ${{ command: 33 }}                                        | ${false}
        ${{ command: 'SelectFolderMessage' }}                     | ${false}
        ${{ command: 'SelectFolderMessage', value: '/' }}         | ${true}
        ${msgSelectFolder}                                        | ${true}
        ${{ command: 'ConfigurationChangeMessage', value: {} }}   | ${true}
        ${{ command: 'ConfigurationChangeMessage', value: true }} | ${false}
        ${{ command: 'ConfigurationChangeMessage', value: null }} | ${false}
        ${{ command: 'ConfigurationChangeMessage' }}              | ${false}
        ${msgConfigurationChangeMessage}                          | ${true}
    `('isMessage $msg', ({ msg, expected }) => {
        expect(isMessage(msg)).toBe(expected);
    });

    test('isConfigurationChangeMessage', () => {
        const msgSelectFolder: SelectFolderMessage = {
            command: 'SelectFolderMessage',
            value: '/',
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isConfigurationChangeMessage({ command: 'SelectFileMessage' })).toBe(false);
        expect(isConfigurationChangeMessage(msgSelectFolder)).toBe(false);
        expect(isConfigurationChangeMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isConfigurationChangeMessage(msgConfigurationChangeMessage)).toBe(true);
    });

    test('isConfigurationChangeMessage', () => {
        const msgSelectFolder: SelectFolderMessage = {
            command: 'SelectFolderMessage',
            value: '/',
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isConfigurationChangeMessage({ command: 'SelectFileMessage' })).toBe(false);
        expect(isConfigurationChangeMessage(msgSelectFolder)).toBe(false);
        expect(isConfigurationChangeMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isConfigurationChangeMessage(msgConfigurationChangeMessage)).toBe(true);
    });

    test('isSelectFileMessage', () => {
        const msgUpdateCounter: SelectFileMessage = {
            command: 'SelectFileMessage',
            value: '../file.ts',
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isSelectFileMessage({ command: 'SelectFileMessage' })).toBe(false);
        expect(isSelectFileMessage(msgUpdateCounter)).toBe(true);
        expect(isSelectFileMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isSelectFileMessage(msgConfigurationChangeMessage)).toBe(false);
    });

    test('isSelectFolderMessage', () => {
        const msgUpdateCounter: SelectFolderMessage = {
            command: 'SelectFolderMessage',
            value: '../file.ts',
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isSelectFolderMessage({ command: 'SelectFolderMessage' })).toBe(false);
        expect(isSelectFolderMessage(msgUpdateCounter)).toBe(true);
        expect(isSelectFolderMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isSelectFolderMessage(msgConfigurationChangeMessage)).toBe(false);
    });

    test('isEnableLocaleMessage', () => {
        const msg: EnableLocaleMessage = {
            command: 'EnableLocaleMessage',
            value: { target: 'folder', uri: 'uri', locale: 'en', enable: true },
        };
        expect(isEnableLocaleMessage({ command: 'SelectFolderMessage' })).toBe(false);
        expect(isEnableLocaleMessage({ command: 'EnableLocaleMessage' })).toBe(false);
        expect(isEnableLocaleMessage(msg)).toBe(true);
    });
});
