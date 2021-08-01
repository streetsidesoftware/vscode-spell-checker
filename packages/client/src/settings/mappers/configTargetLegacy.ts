import { capitalize } from '../../util';
import { ClientConfigTarget } from '../clientConfigTarget';
import { configurationTargetToDictionaryScope } from '../targetAndScope';
import { ConfigTargetLegacy, normalizeTarget } from '../vsConfig';

export function mapConfigTargetLegacyToClientConfigTarget(t: ConfigTargetLegacy): ClientConfigTarget {
    const target = normalizeTarget(t);
    const scope = configurationTargetToDictionaryScope(target.target);
    return {
        name: capitalize(scope),
        kind: 'vscode',
        scope,
        docUri: target.uri,
        configScope: target.configScope,
    };
}
