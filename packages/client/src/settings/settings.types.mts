import type { ClientConfigScope, ClientConfigTarget } from './clientConfigTarget.js';

export interface TargetsAndScopes {
    /** all targets that have an influence on changing a setting */
    targets: ClientConfigTarget[];
    /** possible scopes to apply the setting. */
    scopes: ClientConfigScope[];
}
