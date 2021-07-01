import { CommandsToClient } from './api';
import { Command } from 'vscode-languageserver/node';

const prefix = 'cSpell.';

type CreateClientSideCommand = {
    [command in keyof CommandsToClient]: (title: string, ...params: Parameters<CommandsToClient[command]>) => Command;
};

export const clientCommands: CreateClientSideCommand = {
    addWordsToConfigFileFromServer: (title: string, ...params) => Command.create(title, prefix + 'addWordsToConfigFile', ...params),
    addWordsToDictionaryFileFromServer: (title: string, ...params) => Command.create(title, prefix + 'addWordsToDictionaryFile', ...params),
    addWordsToVSCodeSettingsFromServer: (title: string, ...params) => Command.create(title, prefix + 'addWordsToVSCodeSettings', ...params),
};
