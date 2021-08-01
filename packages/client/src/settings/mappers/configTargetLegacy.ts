import { ConfigurationTarget } from 'vscode';
import { mustBeDefined } from '../../util';
import { ClientConfigTarget } from '../clientConfigTarget';
import { ConfigTargetLegacy } from '../vsConfig';

export function mapConfigTargetLegacyToClientConfigTarget(t: ConfigTargetLegacy): ClientConfigTarget {
    if (t === ConfigurationTarget.Global) {
        return {
            name: 'User',
            kind: 'vscode',
            scope: 'user',
            docUri: undefined,
            configScope: undefined,
        };
    }
    if (t.target === ConfigurationTarget.Workspace) {
        return {
            name: 'Workspace',
            kind: 'vscode',
            scope: 'workspace',
            docUri: t.uri,
            configScope: t.configScope,
        };
    }
    return {
        name: 'Folder',
        kind: 'vscode',
        scope: 'folder',
        docUri: mustBeDefined(t.uri),
        configScope: t.configScope,
    };
}
