import { ConfigurationTarget } from 'vscode';
import {
    configurationTargetToClientConfigScopeInfluenceRange,
    configurationTargetToDictionaryScope,
    dictionaryScopeToConfigurationTarget,
} from './targetAndScope';

describe('targetAndScope', () => {
    test.each`
        scope          | configTarget
        ${'user'}      | ${ConfigurationTarget.Global}
        ${'workspace'} | ${ConfigurationTarget.Workspace}
        ${'folder'}    | ${ConfigurationTarget.WorkspaceFolder}
    `('dictionaryScopeToConfigurationTarget $scope $configTarget', ({ scope, configTarget }) => {
        expect(dictionaryScopeToConfigurationTarget(scope)).toBe(configTarget);
        expect(configurationTargetToDictionaryScope(configTarget)).toBe(scope);
    });

    test.each`
        target                                 | expected
        ${ConfigurationTarget.Global}          | ${['user', 'workspace', 'folder', 'unknown']}
        ${ConfigurationTarget.Workspace}       | ${['workspace', 'folder', 'unknown']}
        ${ConfigurationTarget.WorkspaceFolder} | ${['folder', 'unknown']}
    `('configurationTargetToClientConfigScopeInfluenceRange', ({ target, expected }) => {
        expect(configurationTargetToClientConfigScopeInfluenceRange(target)).toEqual(expected);
    });
});
