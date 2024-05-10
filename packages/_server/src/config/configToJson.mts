import type { CSpellSettings } from '@cspell/cspell-types';

export function configToJson(config: CSpellSettings, exclude: string[] = []): string {
    function replacer(_key: string, value: unknown) {
        if (value instanceof RegExp) {
            return value.toString();
        }
        return value;
    }

    const excludeSet = new Set(exclude);

    const obj: Record<string, unknown> = Object.fromEntries(Object.entries(config).filter(([key]) => !excludeSet.has(key)));

    return JSON.stringify(obj, replacer, 2);
}
