import { ClientConfigTarget } from '../clientConfigTarget';
import { createClientConfigTargetVSCode } from '../configTargetHelper';
import { ConfigTargetLegacy, normalizeTarget } from '../vsConfig';

export function mapConfigTargetLegacyToClientConfigTarget(t: ConfigTargetLegacy): ClientConfigTarget {
    const target = normalizeTarget(t);
    return createClientConfigTargetVSCode(target.target, target.uri, target.configScope);
}
