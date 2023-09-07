import type { ClientConfigTarget } from '../clientConfigTarget';
import { createClientConfigTargetVSCode } from '../configTargetHelper';
import type { ConfigTargetLegacy } from '../vsConfig';
import { normalizeTarget } from '../vsConfig';

export function mapConfigTargetLegacyToClientConfigTarget(t: ConfigTargetLegacy): ClientConfigTarget {
    const target = normalizeTarget(t);
    return createClientConfigTargetVSCode(target.target, target.uri, target.configScope);
}
