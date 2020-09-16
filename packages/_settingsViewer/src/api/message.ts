import { Settings, ConfigTarget } from './settings';
export type Commands = 'ConfigurationChangeMessage'
| 'EnableLanguageIdMessage'
| 'EnableLocaleMessage'
| 'RequestConfigurationMessage'
| 'SelectFileMessage'
| 'SelectFolderMessage'
| 'SelectTabMessage'
;

export interface Message {
    command: Commands;
}

export type Messages =
    ConfigurationChangeMessage
    | EnableLanguageIdMessage
    | EnableLocaleMessage
    | RequestConfigurationMessage
    | SelectFileMessage
    | SelectFolderMessage
    | SelectTabMessage
    ;

export function isMessage(data: unknown): data is Message {
    return !!(data
        && typeof data === 'object'
        && data.hasOwnProperty('command')
        && typeof data['command'] === 'string'
    );
}

function isA<T extends Message> (cmd: T['command'], fields: ([keyof T, (v: any) => boolean])[]): (msg: Message) => msg is T {
    return function (msg: Message): msg is T {
        const t = msg as T;
        return msg.command === cmd
        && fields.reduce((success, [key, fn]) => success && fn(t[key]), true);
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

export interface EnableLanguageIdMessage extends Message {
    command: 'EnableLanguageIdMessage';
    value: {
        target?: ConfigTarget;
        uri?: string;
        languageId: string;
        enable: boolean;
    };
}

export interface EnableLocaleMessage extends Message {
    command: 'EnableLocaleMessage';
    value: {
        target: ConfigTarget;
        uri: string | undefined;
        locale: string;
        enable: boolean;
    };
}

export const isConfigurationChangeMessage = isA<ConfigurationChangeMessage>('ConfigurationChangeMessage', [['value', isObject]]);
export const isEnableLanguageIdMessage = isA<EnableLanguageIdMessage>('EnableLanguageIdMessage', [['value', isObject]]);
export const isEnableLocaleMessage = isA<EnableLocaleMessage>('EnableLocaleMessage', [['value', isObject]]);
export const isRequestConfigurationMessage = isA<RequestConfigurationMessage>('RequestConfigurationMessage', []);
export const isSelectFileMessage = isA<SelectFileMessage>('SelectFileMessage', [['value', isString]]);
export const isSelectFolderMessage = isA<SelectFolderMessage>('SelectFolderMessage', [['value', isString]]);
export const isSelectTabMessage = isA<SelectTabMessage>('SelectTabMessage', [['value', isString]]);

interface Record {}

function isObject(v: any): v is Record { return typeof v === 'object' && v !== null; }
function isString(v: any): v is string { return typeof v === 'string'; }
