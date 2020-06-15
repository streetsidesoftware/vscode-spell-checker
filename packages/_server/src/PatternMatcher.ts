// import { TextDocument } from 'vscode-languageserver-textdocument';
import { CSpellUserSettings } from './cspellConfig';
import { ExecRegExpResult, RegExpWorker, TimeoutError } from 'regexp-worker';

export interface Pattern {
    name: string;
    regexp: RegExp;
}

export type Range = [number, number];

export interface PatternMatch {
    name: string;
    regexp: RegExp;
    elapsedTimeMs: number;
    ranges: Range[];
}

export interface PatternMatchTimeout {
    name: string;
    regexp: RegExp;
    elapsedTimeMs: number;
    message: string;
}

export type MatchResult = PatternMatch | PatternMatchTimeout;
export type MatchResults = MatchResult[];

export type PatternSettings = {
    patterns: CSpellUserSettings['patterns'];
}

export class PatternMatcher {
    private worker: RegExpWorker = new RegExpWorker();
    public dispose = () => this.worker.dispose();

    async matchPatternsInText(patterns: string[], text: string, settings: PatternSettings): Promise<MatchResults> {
        const resolvedPatterns = resolvePatterns(patterns, settings);

        // Optimistically expect them all to work.
        try {
            const fullResult = await matchMatrix(this.worker, text, resolvedPatterns);
            return fullResult;
        } catch (e) {
            if (!isTimeoutError(e)) {
                return Promise.reject(e);
            }
        }

        // At least one of the expressions failed to complete in time.
        // Process them one-by-one
        const results = resolvedPatterns.map(pat => exec(this.worker, text, pat))
        return Promise.all(results);
    }
}

export function isPatternMatch(m: MatchResult): m is PatternMatch {
    return Array.isArray((m as PatternMatch).ranges);
}

export function isPatternMatchTimeout(m: MatchResult): m is PatternMatchTimeout {
    return !isPatternMatch(m);
}

function matchMatrix(worker: RegExpWorker, text: string, patterns: Pattern[]): Promise<PatternMatch[]> {
    const regexArray = patterns.map(pat => pat.regexp);
    const result = worker.execRegExpMatrix(regexArray, [text])
    .then(r => {
        return r.matrix
        // Flatten the result since we only sent 1 block of text.
        .map(perRegExp => perRegExp.results[0])
        .map((result, index) => toPatternMatch(patterns[index], result))
    })
    return result;
}

function exec(worker: RegExpWorker, text: string, pattern: Pattern): Promise<MatchResult> {
    return worker
    .execRegExp(pattern.regexp, text)
    .then(r => toPatternMatch(pattern, r))
    .catch(e => toPatternMatchTimeout(pattern, e))
}

function toPatternMatchTimeout(pattern: Pattern, error: any | TimeoutError): PatternMatchTimeout | Promise<PatternMatchTimeout> {
    if (!isTimeoutError(error)) return Promise.reject(error);
    return {
        ...error,
        ...pattern,
    };
}

function isTimeoutError(e: any | TimeoutError): e is TimeoutError {
    return typeof e === 'object'
    && typeof e.message === 'string'
    && typeof e.elapsedTimeMs === 'number'
}

function toPatternMatch(pattern: Pattern, result: ExecRegExpResult): PatternMatch {
    return {
        ...pattern,
        elapsedTimeMs: result.elapsedTimeMs,
        ranges: result.matches.map(toRange)
    }
}

function toRange(match: RegExpExecArray): Range {
    const s = match.index;
    return [s, s + match[0].length];
}

function resolvePatterns(patterns: string[], settings: PatternSettings): Pattern[] {
    const knownPatterns = extractPatternsFromSettings(settings)
    const matchingPatterns = patterns
        .map(pat => knownPatterns.get(pat.toLowerCase()) || ({ name: pat, regexp: toRegExp(pat, 'g')}))
    return matchingPatterns;
}

function extractPatternsFromSettings(settings: PatternSettings): Map<string, Pattern> {
    const knownPatterns = settings.patterns
        ?.map(({name, pattern}) => ({ name, regexp: toRegExp(pattern) }))
        .map(pat => [pat.name.toLowerCase(), pat] as [string, Pattern])
    return new Map(knownPatterns || []);
}

export function toRegExp(r: RegExp | string, defaultFlags?: string): RegExp {
    if (isRegExp(r)) return r;

    const match = r.match(/^\/(.*)\/([gimsuy]*)$/);
    if (match) {
        return new RegExp(match[1], match[2] || defaultFlags);
    }
    return new RegExp(r, defaultFlags);
}

export function isRegExp(r: RegExp | any): r is RegExp {
    return r instanceof RegExp;
}
