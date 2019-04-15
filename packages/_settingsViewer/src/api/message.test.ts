import { isConfigurationChangeMessage, ConfigurationChangeMessage, isMessage, SelectFileMessage, isSelectFileMessage, SelectFolderMessage, isSelectFolderMessage, isEnableLanguageIdMessage, EnableLanguageIdMessage, EnableLocalMessage, isEnableLocalMessage } from './message';
import { sampleSettings } from '../test/samples/sampleSettings';


describe('Validate Messages', () => {

    it('isMessage', () => {
        const msgSelectFolder: SelectFolderMessage = {
            command: 'SelectFolderMessage',
            value: '/'
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isMessage({})).toBe(false);
        expect(isMessage(5)).toBe(false);
        expect(isMessage(new Date())).toBe(false);
        expect(isMessage(null)).toBe(false);
        expect(isMessage(undefined)).toBe(false);
        expect(isMessage({ command: 'UpdateCounter' })).toBe(true);
        expect(isMessage({ command: 33 })).toBe(false);
        expect(isMessage({ command: 'SelectFolderMessage' })).toBe(true);
        expect(isMessage({ command: 'SelectFolderMessage', value: '/' })).toBe(true);
        expect(isMessage(msgSelectFolder)).toBe(true);
        expect(isMessage({ command: 'ConfigurationChangeMessage' })).toBe(true);
        expect(isMessage(msgConfigurationChangeMessage)).toBe(true);
    });

    it('isConfigurationChangeMessage', () => {
        const msgSelectFolder: SelectFolderMessage = {
            command: 'SelectFolderMessage',
            value: '/'
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
            value: '/'
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
            value: '../file.ts'
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
            value: '../file.ts'
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

    test('isEnableLocalMessage', () => {
        const msg: EnableLocalMessage = {
            command: 'EnableLocalMessage', value: { target: 'folder', uri: 'uri', local: 'en', enable: true }
        };
        expect(isEnableLocalMessage({ command: 'SelectFolderMessage' })).toBe(false);
        expect(isEnableLocalMessage({ command: 'EnableLocalMessage' })).toBe(false);
        expect(isEnableLocalMessage(msg)).toBe(true);
    });
});
