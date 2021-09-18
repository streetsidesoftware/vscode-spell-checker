/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { codes } from './languageCodes';

export interface LangCountryPair {
    code: string;
    lang: string;
    country: string;
}

const langCodes = new Map<string, LangCountryPair>(
    codes.map((parts) => {
        const [code, lang, country = ''] = parts;
        return [code, { code, lang, country }] as [string, LangCountryPair];
    })
);

const regExReplace = /^([a-z]{2})[-_]?([a-z]{0,2})$/i;
// const regExValidate = /^([a-z]{2})(-[A-Z]{2})?$/;

export function normalizeCode(code: string) {
    return code.replace(regExReplace, (_match: string, p1: string, p2: string) => {
        const lang = p1.toLowerCase();
        const locale = p2.toUpperCase();
        return locale ? `${lang}-${locale}` : lang;
    });
}

export function isValidCode(code: string) {
    return langCodes.has(code);
}

export function lookupCode(code: string) {
    return langCodes.get(code);
}
