import { codes } from './languageCodes';

export interface LangCountryPair {
    lang: string;
    country: string;
}

const langCodes = new Map<string, LangCountryPair>(
    codes
        .map((parts) => {
            const [code, lang, country = ''] = parts;
            return [code, { lang, country }] as [string, LangCountryPair];
        })
);

const regExReplace = /^([a-z]{2})[-_]?([a-z]{0,2})$/i;
// const regExValidate = /^([a-z]{2})(-[A-Z]{2})?$/;

export function normalizeCode(code: string) {
    return code.replace(regExReplace, (match: string, p1: string, p2: string) => {
        const lang = p1.toLowerCase();
        const local = p2.toUpperCase();
        return local ? `${lang}-${local}` : lang;
    });
}

export function isValidCode(code: string) {
    return langCodes.has(code);
}

export function lookupCode(code: string) {
    return langCodes.get(code);
}
