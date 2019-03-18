import { Settings } from './settings';
export type Commands = 'UpdateCounter'
| 'ConfigurationChangeMessage'
| 'RequestConfigurationMessage'
| 'SelectTabMessage'
| 'SelectFolderMessage'
| 'SelectFileMessage'
;

export interface Message {
    command: Commands;
}

export type Messages =
    UpdateCounterMessage
    | ConfigurationChangeMessage
    | RequestConfigurationMessage
    | SelectTabMessage
    | SelectFolderMessage
    | SelectFileMessage
    ;

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
    activeTab?: string;
    settings: Settings;
}

export interface ConfigurationChangeMessage extends Message {
    command: 'ConfigurationChangeMessage';
    value: ConfigurationChange;
}

export interface RequestConfigurationMessage extends Message {
    command: 'RequestConfigurationMessage';
}

export interface SelectTabMessage extends Message {
    command: 'SelectTabMessage';
    value: string;
}

export interface SelectFolderMessage extends Message {
    command: 'SelectFolderMessage';
    value: string;
}

export interface SelectFileMessage extends Message {
    command: 'SelectFileMessage';
    value: string;
}

export const isUpdateCounterMessage = isA<UpdateCounterMessage>('UpdateCounter', ['value']);
export const isConfigurationChangeMessage = isA<ConfigurationChangeMessage>('ConfigurationChangeMessage', ['value']);
export const isRequestConfigurationMessage = isA<RequestConfigurationMessage>('RequestConfigurationMessage', []);
export const isSelectTabMessage = isA<SelectTabMessage>('SelectTabMessage', ['value']);
export const isSelectFolderMessage = isA<SelectFolderMessage>('SelectFolderMessage', ['value']);
export const isSelectFileMessage = isA<SelectFileMessage>('SelectFileMessage', ['value']);
