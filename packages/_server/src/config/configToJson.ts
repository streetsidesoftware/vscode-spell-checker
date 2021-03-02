import { CSpellSettings } from '@cspell/cspell-types';

export function configToJson(config: CSpellSettings): string {
    function replacer(_key: string, value: unknown) {
        if (value instanceof RegExp) {
            return value.toString();
        }
        return value;
    }
    return JSON.stringify(config, replacer, 2);
}
