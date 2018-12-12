import {
    ConfigurationForDocument,
} from './settings/';

export type Commands = 'UpdateCounter' | 'ConfigurationChangeMessage';

export interface Message {
    command: Commands;
}

export function isMessage(data: any): data is Message {
    return data && typeof data === 'object' && data.hasOwnProperty('command');
}

export interface UpdateCounterMessage extends Message {
    command: 'UpdateCounter';
    value: number;
}

function isA<T extends Message> (cmd: T['command']): (msg: Message) => msg is T {
    return function (msg: Message): msg is T {
        return msg.command === cmd;
    };
}

export interface ConfigurationChange {
    config: ConfigurationForDocument;
}

export interface ConfigurationChangeMessage extends Message {
    command: 'ConfigurationChangeMessage';
    value: ConfigurationChange;
}

export const isUpdateCounterMessage = isA<UpdateCounterMessage>('UpdateCounter');
export const isConfigurationChangeMessage = isA<ConfigurationChangeMessage>('ConfigurationChangeMessage');
