import { Command } from 'vscode-languageserver/node.js';

import type { CommandsToClient } from './api.js';

const prefix = 'cSpell.';

type CreateClientSideCommand = {
    [command in keyof CommandsToClient]: (title: string, ...params: Parameters<CommandsToClient[command]>) => Command;
};

type CreateClientSideCommandKeys = {
    [key in keyof CreateClientSideCommand]: key;
};

const clientCommandsKeys: CreateClientSideCommandKeys = {
    addWordsToConfigFileFromServer: 'addWordsToConfigFileFromServer',
    addWordsToDictionaryFileFromServer: 'addWordsToDictionaryFileFromServer',
    addWordsToVSCodeSettingsFromServer: 'addWordsToVSCodeSettingsFromServer',
};

/**
 * API to create commands to be sent to the Client
 */
export const clientCommands: CreateClientSideCommand = {
    addWordsToConfigFileFromServer: (title: string, ...params) =>
        Command.create(title, prefix + clientCommandsKeys.addWordsToConfigFileFromServer, ...params),
    addWordsToDictionaryFileFromServer: (title: string, ...params) =>
        Command.create(title, prefix + clientCommandsKeys.addWordsToDictionaryFileFromServer, ...params),
    addWordsToVSCodeSettingsFromServer: (title: string, ...params) =>
        Command.create(title, prefix + clientCommandsKeys.addWordsToVSCodeSettingsFromServer, ...params),
};
