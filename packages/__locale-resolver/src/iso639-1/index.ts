import { codes } from './languageCodes';
import { scriptCodes } from './scriptCodes';

export interface LocaleInfo extends LangCountryPair, Partial<ScriptInfo> {}

export interface ScriptInfo {
    /** [ISO 15924 Script Code](https://en.wikipedia.org/wiki/ISO_15924#List_of_codes) */
    script: string;
    /** English name of Script */
    scriptName: string;
}

export interface Locale {
    /** ISO 639-1 two letter code */
    lang: string;
    /** [ISO 15924 Script Code](https://en.wikipedia.org/wiki/ISO_15924#List_of_codes) */
    script: string;
    /** ISO_3166-1_alpha-2 two letter locale or empty string */
    locale: string;
}

interface LangCountryPair {
    /** Normalized code */
    code: string;
    /** ISO 639-1 two letter code */
    lang: string;
    /** Language in English */
    language: string;
    /** ISO_3166-1_alpha-2 two letter locale or empty string */
    locale: string;
    /**
     * English country / region name
     * Empty string if unknown.
     */
    country: string;
}

interface LangInfo {
    /** ISO 639-1 two letter code */
    lang: string;
    /** Language in English */
    language: string;
}

interface CountryInfo {
    /** ISO_3166-1_alpha-2 two letter locale or empty string */
    locale: string;
    /**
     * English country / region name
     * Empty string if unknown.
     */
    country: string;
}

const regExpParseCode = /^(?<lang>[a-z]{2})(?:[-_]?(?<script>[a-z]{4}))?[-_]?(?<locale>[a-z0-9]{0,2})$/i;
// const regExValidate = /^([a-z]{2})(-[A-Z]{2})?$/;

const langCodesMap = new Map<string, LangCountryPair>(
    codes.map((parts) => {
        const [code, lang, country = ''] = parts;
        const locale = code.match(regExpParseCode)?.groups?.locale || '';
        const lcp: LangCountryPair = {
            code,
            language: lang,
            country,
            locale,
            lang: code.replace(/-.*/, ''),
        };
        return [code, lcp] as const;
    }),
);

const languageInfoMap = new Map<string, LangInfo>(
    [...langCodesMap.values()].map(({ lang, language }) => [lang, { lang, language }] as const),
);
languageInfoMap.set('lorem', { lang: 'lorem', language: 'Lorem-Ipsum' });
languageInfoMap.set('lorem-ipsum', { lang: 'lorem-ipsum', language: 'Lorem-Ipsum' });

const countryInfoMap = new Map<string, CountryInfo>(
    [...langCodesMap.values()].map(({ locale, country }) => [locale, { locale, country }] as const),
);

const langScriptsMap = new Map<string, ScriptInfo>(scriptCodes.map(([script, scriptName]) => [script, { script, scriptName }]));

const langScriptCodeLookup = new Map(scriptCodes.map(([code]) => [code.toLowerCase(), code]));

const localeLorem: Locale = Object.freeze({
    lang: 'lorem',
    locale: '',
    script: '',
});

const localeLoremIpsum: Locale = Object.freeze({
    lang: 'lorem-ipsum',
    locale: '',
    script: '',
});

// const localInfoLoremIpsum: LocaleInfo = Object.freeze({
//     code: 'lorem-Ipsum',
//     lang: 'lorem',
//     locale: 'Ipsum',
//     language: 'lorem-ipsum',
//     country: '',
//     script: '',
//     scriptName: '',
// });

const regExIsLoremIpsum = /^lorem(?:[-_]?ipsum)?$/i;

export function normalizeCode(code: string): string;
export function normalizeCode(code: string, strict: false): string;
export function normalizeCode(code: string, strict: true): string | undefined;
export function normalizeCode(code: string, strict: boolean): string | undefined;
export function normalizeCode(code: string, strict = false): string | undefined {
    const locale = parseLocale(code);
    if (!locale) return strict ? undefined : code;
    return formatLocale(locale);
}

export function isValidCode(code: string): boolean {
    return langCodesMap.has(code) || !!lookupLocaleInfo(code);
}

export function lookupLocaleInfo(code: string): LocaleInfo | undefined {
    const locale = parseLocale(code);
    if (!locale) return undefined;
    const langInfo = getLangInfo(locale.lang);
    const scriptInfo = locale.script ? getScriptInfo(locale.script) : {};
    const countryInfo = locale.locale ? getCountryInfo(locale.locale) : { locale: '', country: '' };
    return (
        (langInfo !== undefined &&
            scriptInfo !== undefined &&
            countryInfo !== undefined && { ...langInfo, ...scriptInfo, ...countryInfo, code: formatLocale(locale) }) ||
        undefined
    );
}

export function getLangInfo(langCode: string): LangInfo | undefined {
    return languageInfoMap.get(langCode.toLowerCase());
}

export function getCountryInfo(countryCode: string): CountryInfo | undefined {
    return countryInfoMap.get(countryCode.toUpperCase());
}

export function getScriptInfo(scriptCode: string): ScriptInfo | undefined {
    const script = langScriptCodeLookup.get(scriptCode.toLowerCase());
    return (script && langScriptsMap.get(script)) || undefined;
}

function toTitleCase(s: string): string {
    const first = s.slice(0, 1);
    const rest = s.slice(1);
    return first.toUpperCase() + rest.toLowerCase();
}

export function parseLocale(code: string): Locale | undefined {
    code = code.trim();
    const match = code.match(regExpParseCode);
    if (!match) return parseLorem(code);
    const { lang = '', script = '', locale = '' } = match.groups || {};
    return {
        lang: lang.toLowerCase(),
        script: toTitleCase(script),
        locale: locale.toUpperCase(),
    };
}

function parseLorem(code: string): Locale | undefined {
    if (code.toLowerCase() === 'lorem') return localeLorem;
    return regExIsLoremIpsum.test(code) ? localeLoremIpsum : undefined;
}

export function formatLocale({ lang, locale, script }: Locale): string {
    return lang + (script && '-' + script) + (locale && '-' + locale);
}

export function formatLangAndLocale({ lang, locale }: Locale): string {
    return lang + (locale && '-' + locale);
}
