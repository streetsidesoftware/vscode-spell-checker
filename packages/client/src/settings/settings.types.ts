import { ClientConfigScope, ClientConfigTarget } from './clientConfigTarget';

export interface TargetsAndScopes {
    /** all targets that have an influence on changing a setting */
    targets: ClientConfigTarget[];
    /** possible scopes to apply the setting. */
    scopes: ClientConfigScope[];
}
