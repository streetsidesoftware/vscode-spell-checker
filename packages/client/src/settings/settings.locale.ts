import { ClientConfigScope, ClientConfigTarget, orderScope } from './clientConfigTarget';
import { quickPickTarget } from './configTargetHelper';
import type { CSpellUserSettings } from './settings.base';
import { applyToConfig, normalizeLocale, orderTargetsLocalToGlobal, readConfigTargetValues } from './settings.base';

/**
 * Try to add or remove a locale from the nearest configuration.
 * Present the user with the option to pick a target if more than one viable target is available.
 *
 * @param locale - locale to add or remove
 * @param enable - true = add
 * @param targets - all known targets
 * @param possibleScopes - possible scopes
 * @returns resolves when finished - rejects if an error was encountered.
 */
export async function enableLocaleForTarget(
    locale: string,
    enable: boolean,
    targets: ClientConfigTarget[],
    possibleScopes: ClientConfigScope[]
): Promise<void> {
    // Have targets inherit values.
    targets = targets.map((t) => ({ ...t, useMerge: t.useMerge ?? t.kind === 'vscode' }));

    const allowedScopes = new Set(orderScope(possibleScopes));
    const orderedTargets = new Set(orderTargetsLocalToGlobal(targets));
    const mapTargetsToValue = new Map(await readConfigTargetValues([...orderedTargets], 'language'));
    const possibleTargets = new Set([...orderedTargets].filter((t) => allowedScopes.has(t.scope)));

    if (!enable) {
        // remove all non-overlapping targets.
        [...mapTargetsToValue].filter(([_, v]) => !doLocalesIntersect(locale, v.language)).forEach(([t]) => possibleTargets.delete(t));
    } else {
        const keep = [...possibleTargets];
        const targetsWithLocale = new Set([...mapTargetsToValue].filter(([_, v]) => isLocaleSubsetOf(locale, v.language)).map(([t]) => t));
        let clear = false;
        for (const t of possibleTargets) {
            clear = clear || targetsWithLocale.has(t);
            if (clear) possibleTargets.delete(t);
        }
        // If nothing is left, let the user pick from any of the possible set.
        if (!possibleTargets.size) {
            // Add back any that have not already been set.
            keep.filter((t) => !targetsWithLocale.has(t)).forEach((t) => possibleTargets.add(t));
        }
    }

    const t = possibleTargets.size > 1 ? await quickPickTarget([...possibleTargets]) : [...possibleTargets][0];
    if (!t) return;

    const defaultValue = calcInheritedDefault('language', t, mapTargetsToValue);

    const applyFn: (src: string | undefined) => string | undefined = enable
        ? (currentLanguage) => addLocaleToCurrentLocale(locale, currentLanguage || defaultValue)
        : (currentLanguage) => removeLocaleFromCurrentLocale(locale, currentLanguage);

    return applyToConfig([t], 'language', applyFn);
}

function normalize(locale: string) {
    return normalizeLocale(locale)
        .split(',')
        .filter((a) => !!a);
}

function addLocaleToCurrentLocale(locale: string, currentLocale: string | undefined): string | undefined {
    const toAdd = normalize(locale);
    const currentSet = new Set(normalize(currentLocale || ''));

    toAdd.forEach((locale) => currentSet.add(locale));

    return [...currentSet].join(',') || undefined;
}

function removeLocaleFromCurrentLocale(locale: string, currentLocale: string | undefined): string | undefined {
    const toRemove = normalize(locale);
    const currentSet = new Set(normalize(currentLocale || ''));

    toRemove.forEach((locale) => currentSet.delete(locale));

    return [...currentSet].join(',') || undefined;
}

function doLocalesIntersect(localeA: string, localeB: string): boolean;
function doLocalesIntersect(localeA: string, localeB: undefined): false;
function doLocalesIntersect(localeA: string, localeB: string | undefined): boolean;
function doLocalesIntersect(localeA: string, localeB: string | undefined): boolean {
    if (!localeA || !localeB) return false;

    const a = new Set(normalize(localeA));
    const b = normalize(localeB);
    for (const locale of b) {
        if (a.has(locale)) return true;
    }
    return false;
}

function isLocaleSubsetOf(localeA: string, localeB: string): boolean;
function isLocaleSubsetOf(localeA: string, localeB: undefined): false;
function isLocaleSubsetOf(localeA: string, localeB: string | undefined): boolean;
function isLocaleSubsetOf(localeA: string, localeB: string | undefined): boolean {
    if (!localeA || !localeB) return false;

    const largerSet = new Set(normalize(localeB));
    const smallerSet = normalize(localeA);
    for (const locale of smallerSet) {
        if (!largerSet.has(locale)) return false;
    }
    return true;
}

function calcInheritedDefault<K extends keyof CSpellUserSettings>(
    key: K,
    target: ClientConfigTarget,
    targetsWithValue: Iterable<[ClientConfigTarget, CSpellUserSettings]>
): CSpellUserSettings[K] {
    const tv = [...targetsWithValue].reverse();
    let value: CSpellUserSettings[K] = undefined;
    for (const [t, v] of tv) {
        value = v[key] ?? value;
        if (t === target) break;
    }
    return value;
}

export const __testing__ = {
    addLocaleToCurrentLocale,
    removeLocaleFromCurrentLocale,
    doLocalesIntersect,
    isLocaleSubsetOf,
};
