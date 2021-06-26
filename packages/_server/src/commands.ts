import { CommandsToClient } from './api';
import { Command } from 'vscode-languageserver/node';

const prefix = 'cSpell.';

type CreateClientSideCommand = {
    [command in keyof CommandsToClient]: (title: string, ...params: Parameters<CommandsToClient[command]>) => Command;
};

export const clientCommands: CreateClientSideCommand = {
    addWordsToConfigFile: (title: string, ...params) => Command.create(title, prefix + 'addWordsToConfigFile', ...params),
    addWordsToDictionaryFile: (title: string, ...params) => Command.create(title, prefix + 'addWordsToDictionaryFile', ...params),
    addWordsToVSCodeSettings: (title: string, ...params) => Command.create(title, prefix + 'addWordsToVSCodeSettings', ...params),
};
