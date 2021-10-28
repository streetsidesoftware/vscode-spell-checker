import { Settings, ConfigTarget } from './settings';

/**
 * @private
 */
export interface DefinedCommands {
    ConfigurationChangeMessage: ConfigurationChangeMessage;
    EnableLanguageIdMessage: EnableLanguageIdMessage;
    EnableLocaleMessage: EnableLocaleMessage;
    RequestConfigurationMessage: RequestConfigurationMessage;
    SelectFileMessage: SelectFileMessage;
    SelectFolderMessage: SelectFolderMessage;
    SelectTabMessage: SelectTabMessage;
    OpenLinkMessage: OpenLinkMessage;
}

type IsAMessageOf = {
    [k in keyof DefinedCommands]: (msg: IMessage) => msg is DefinedCommands[k];
};

export type Commands = keyof DefinedCommands;

interface IMessage {
    command: Commands;
}

export type CommandMessage = DefinedCommands[Commands];

function isIMessage(data: unknown): data is IMessage {
    if (typeof data !== 'object' || !data || !data.hasOwnProperty('command')) return false;
    return typeof (<IMessage>data).command === 'string';
}

export function isMessage(data: unknown): data is CommandMessage {
    if (!isIMessage(data)) return false;
    const msg = <CommandMessage>data;
    return isMessageOf<CommandMessage>(msg);
}

function isA<T extends IMessage>(cmd: T['command'], fields: [keyof T, (v: any) => boolean][]): (msg: IMessage) => msg is T {
    return function (msg: IMessage): msg is T {
        const t = msg as T;
        return msg.command === cmd && fields.reduce((success: boolean, [key, fn]) => success && fn(t[key]), true);
    };
}

export interface ConfigurationChange {
    activeTab?: string;
    settings: Settings;
}

export interface ConfigurationChangeMessage extends IMessage {
    command: 'ConfigurationChangeMessage';
    value: ConfigurationChange;
}

export interface RequestConfigurationMessage extends IMessage {
    command: 'RequestConfigurationMessage';
}

export interface SelectTabMessage extends IMessage {
    command: 'SelectTabMessage';
    value: string;
}

export interface SelectFolderMessage extends IMessage {
    command: 'SelectFolderMessage';
    value: string;
}

export interface SelectFileMessage extends IMessage {
    command: 'SelectFileMessage';
    value: string;
}

export interface EnableLanguageIdMessage extends IMessage {
    command: 'EnableLanguageIdMessage';
    value: {
        target?: ConfigTarget;
        uri?: string;
        languageId: string;
        enable: boolean;
    };
}

export interface EnableLocaleMessage extends IMessage {
    command: 'EnableLocaleMessage';
    value: {
        target: ConfigTarget;
        uri: string | undefined;
        locale: string;
        enable: boolean;
    };
}

export interface OpenLinkMessage extends IMessage {
    command: 'OpenLinkMessage';
    value: {
        uri: string;
    };
}

export const isConfigurationChangeMessage = isA<ConfigurationChangeMessage>('ConfigurationChangeMessage', [['value', isObject]]);
export const isEnableLanguageIdMessage = isA<EnableLanguageIdMessage>('EnableLanguageIdMessage', [['value', isObject]]);
export const isEnableLocaleMessage = isA<EnableLocaleMessage>('EnableLocaleMessage', [['value', isObject]]);
export const isRequestConfigurationMessage = isA<RequestConfigurationMessage>('RequestConfigurationMessage', []);
export const isSelectFileMessage = isA<SelectFileMessage>('SelectFileMessage', [['value', isString]]);
export const isSelectFolderMessage = isA<SelectFolderMessage>('SelectFolderMessage', [['value', isString]]);
export const isSelectTabMessage = isA<SelectTabMessage>('SelectTabMessage', [['value', isString]]);
export const isOpenLinkMessage = isA<OpenLinkMessage>('OpenLinkMessage', [['value', isObject]]);

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null;
}
function isString(v: unknown): v is string {
    return typeof v === 'string';
}

const isMessageOfMap: IsAMessageOf = {
    ConfigurationChangeMessage: isConfigurationChangeMessage,
    EnableLanguageIdMessage: isEnableLanguageIdMessage,
    EnableLocaleMessage: isEnableLocaleMessage,
    RequestConfigurationMessage: isRequestConfigurationMessage,
    SelectFileMessage: isSelectFileMessage,
    SelectFolderMessage: isSelectFolderMessage,
    SelectTabMessage: isSelectTabMessage,
    OpenLinkMessage: isOpenLinkMessage,
};

export function isMessageOf<M extends CommandMessage>(msg: CommandMessage): msg is M {
    const fn = isMessageOfMap[msg.command];
    return fn?.(msg) ?? false;
}
