import type { ClientConfigTarget } from '../clientConfigTarget.js';
import { createClientConfigTargetVSCode } from '../configTargetHelper.mjs';
import type { ConfigTargetLegacy } from '../vsConfig.mjs';
import { normalizeTarget } from '../vsConfig.mjs';

export function mapConfigTargetLegacyToClientConfigTarget(t: ConfigTargetLegacy): ClientConfigTarget {
    const target = normalizeTarget(t);
    return createClientConfigTargetVSCode(target.target, target.uri, target.configScope);
}
