import { Settings } from './settings';
export type Commands = 'UpdateCounter' | 'ConfigurationChangeMessage' | 'RequestConfigurationMessage';

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

function isA<T extends Message> (cmd: T['command'], fields: (keyof T)[]): (msg: Message) => msg is T {
    return function (msg: Message): msg is T {
        const t = msg as T;
        return msg.command === cmd && fields.reduce((success, key) => success && t[key] !== undefined, true);
    };
}

export interface ConfigurationChange {
    settings: Settings;
}

export interface ConfigurationChangeMessage extends Message {
    command: 'ConfigurationChangeMessage';
    value: ConfigurationChange;
}

export interface RequestConfigurationMessage extends Message {
    command: 'RequestConfigurationMessage';
}

export const isUpdateCounterMessage = isA<UpdateCounterMessage>('UpdateCounter', ['value']);
export const isConfigurationChangeMessage = isA<ConfigurationChangeMessage>('ConfigurationChangeMessage', ['value']);
export const isRequestConfigurationMessage = isA<RequestConfigurationMessage>('RequestConfigurationMessage', []);
