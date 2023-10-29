import type { ConfigurationTarget } from './apiModels.js';
import type { OrPromise } from './generics.js';

export interface CommandsToClient {
    addWordsToVSCodeSettingsFromServer: (words: string[], documentUri: string, target: ConfigurationTarget) => void;
    addWordsToDictionaryFileFromServer: (words: string[], documentUri: string, dict: { uri: string; name: string }) => void;
    addWordsToConfigFileFromServer: (words: string[], documentUri: string, config: { uri: string; name: string }) => void;
}
export type ClientSideCommandHandlerApi = {
    [command in keyof CommandsToClient as `cSpell.${command}`]: (...params: Parameters<CommandsToClient[command]>) => OrPromise<void>;
};
