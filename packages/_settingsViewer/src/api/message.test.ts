import { isConfigurationChangeMessage, UpdateCounterMessage, ConfigurationChangeMessage, isMessage, isUpdateCounterMessage } from './message';
import { Settings } from './settings';

describe('Validate Messages', () => {
    const sampleSettings: Settings = {
        configs: {
            user: undefined,
            workspace: undefined,
            file: undefined,
            folder: undefined,
        },
        locals: {
            user: ['en'],
            workspace: undefined,
            folder: undefined,
            file: ['en'],
        },
        dictionaries: [],
    };

    it('isMessage', () => {
        const msgUpdateCounter: UpdateCounterMessage = {
            command: 'UpdateCounter',
            value: 5
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isMessage({ command: 'UpdateCounter' })).toBe(true);
        expect(isMessage(msgUpdateCounter)).toBe(true);
        expect(isMessage({ command: 'ConfigurationChangeMessage' })).toBe(true);
        expect(isMessage(msgConfigurationChangeMessage)).toBe(true);
    });

    it('isConfigurationChangeMessage', () => {
        const msgUpdateCounter: UpdateCounterMessage = {
            command: 'UpdateCounter',
            value: 5
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isConfigurationChangeMessage({ command: 'UpdateCounter' })).toBe(false);
        expect(isConfigurationChangeMessage(msgUpdateCounter)).toBe(false);
        expect(isConfigurationChangeMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isConfigurationChangeMessage(msgConfigurationChangeMessage)).toBe(true);
    });

    it('isUpdateCounterMessage', () => {
        const msgUpdateCounter: UpdateCounterMessage = {
            command: 'UpdateCounter',
            value: 5
        };
        const msgConfigurationChangeMessage: ConfigurationChangeMessage = {
            command: 'ConfigurationChangeMessage',
            value: { settings: sampleSettings },
        };
        expect(isUpdateCounterMessage({ command: 'UpdateCounter' })).toBe(false);
        expect(isUpdateCounterMessage(msgUpdateCounter)).toBe(true);
        expect(isUpdateCounterMessage({ command: 'ConfigurationChangeMessage' })).toBe(false);
        expect(isUpdateCounterMessage(msgConfigurationChangeMessage)).toBe(false);
    });
});
