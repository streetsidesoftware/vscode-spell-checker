import { ConfigurationTarget } from 'vscode';
import { configurationTargetToDictionaryScope, dictionaryScopeToConfigurationTarget } from './targetAndScope';

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
});
