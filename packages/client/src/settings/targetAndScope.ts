import { ConfigurationTarget } from 'vscode';
import { CustomDictionaryScope, ConfigTargetVSCode } from '../server';

type ConfigScopeVScode = ConfigTargetVSCode['scope'];

type TargetToConfigScope = {
    [key in ConfigurationTarget]: ConfigScopeVScode;
};

type ConfigScopeToTarget = {
    [key in ConfigScopeVScode]: ConfigurationTarget;
};

const targetToScope: TargetToConfigScope = {
    [ConfigurationTarget.Global]: 'user',
    [ConfigurationTarget.Workspace]: 'workspace',
    [ConfigurationTarget.WorkspaceFolder]: 'folder',
} as const;

const ScopeToTarget: ConfigScopeToTarget = {
    user: ConfigurationTarget.Global,
    workspace: ConfigurationTarget.Workspace,
    folder: ConfigurationTarget.WorkspaceFolder,
} as const;

export function configurationTargetToDictionaryScope(target: ConfigurationTarget): CustomDictionaryScope {
    return targetToScope[target];
}

export function dictionaryScopeToConfigurationTarget(scope: ConfigScopeVScode): ConfigurationTarget {
    return ScopeToTarget[scope];
}
