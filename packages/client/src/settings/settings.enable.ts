import type { CSpellUserSettings } from './settings.base';
import {
    applyToConfig,
    calcRelevantTargetInfo,
    findInheritedTargetValue,
    readConfigTargetValues,
    setConfigFieldQuickPick,
} from './settings.base';
import { TargetsAndScopes } from './settings.types';

const enableKey: keyof CSpellUserSettings = 'enabled';

export function setEnableSpellChecking(targetsAndScopes: TargetsAndScopes, enabled: boolean): Promise<void> {
    const { possibleTargets } = calcRelevantTargetInfo(targetsAndScopes);
    return setConfigFieldQuickPick(possibleTargets, enableKey, enabled);
}

export async function toggleEnableSpellChecker(targetsAndScopes: TargetsAndScopes): Promise<void> {
    const { possibleTargets, orderedTargets } = calcRelevantTargetInfo(targetsAndScopes);
    const mapTargetsToValue = new Map(await readConfigTargetValues(orderedTargets, enableKey));
    const possibleTargetsWithValues = possibleTargets.filter((t) => mapTargetsToValue.get(t)?.[enableKey] !== undefined);

    if (!possibleTargets.length) {
        // Nothing to do.
        return;
    }

    const closestTarget = possibleTargetsWithValues[possibleTargetsWithValues.length - 1] ?? possibleTargets[possibleTargets.length - 1];
    const targetCurrentValue = mapTargetsToValue.get(closestTarget)?.[enableKey];
    const found = findInheritedTargetValue(mapTargetsToValue, closestTarget, enableKey);
    const defaultValue = found ?? true; // Global default is true/
    const currentValue = targetCurrentValue ?? defaultValue;
    const newValue = defaultValue !== currentValue ? undefined : !currentValue;
    return applyToConfig([closestTarget], enableKey, () => newValue);
}
