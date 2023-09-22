import type { CSpellSettings } from '@cspell/cspell-types';

export function configToJson(config: CSpellSettings, exclude: string[] = []): string {
    function replacer(_key: string, value: unknown) {
        if (value instanceof RegExp) {
            return value.toString();
        }
        return value;
    }

    const obj: Record<string, unknown> = { ...config };
    exclude.forEach((key) => delete obj[key]);

    return JSON.stringify(obj, replacer, 2);
}
