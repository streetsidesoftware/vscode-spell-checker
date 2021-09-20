import { ClientConfigTarget } from './clientConfigTarget';
import { setConfigFieldQuickPick } from './settings.base';

export function setEnableSpellChecking(targets: ClientConfigTarget[], enabled: boolean): Promise<void> {
    return setConfigFieldQuickPick(targets, 'enabled', enabled);
}

export function toggleEnableSpellChecker(targets: ClientConfigTarget[]): Promise<void> {
    return setConfigFieldQuickPick(targets, 'enabled', (enabled) => !enabled);
}
