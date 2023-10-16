import type { RegExpPatternDefinition } from '@cspell/cspell-types';
import { isDefined } from '@internal/common-utils';
import { logError } from '@internal/common-utils/log';
import { RegExpWorker, type TimeoutError } from 'regexp-worker';
import { format } from 'util';

import type { PatternSettings } from './api';

export type Range = [number, number];

export interface RegExpMatch {
    regexp: RegExp;
    elapsedTimeMs: number;
    ranges: Range[];
}

export interface RegExpMatchTimeout {
    regexp: RegExp;
    elapsedTimeMs: number;
    message: string;
}

export type RegExpMatches = RegExpMatch | RegExpMatchTimeout;

export interface PatternMatch {
    name: string;
    matches: RegExpMatches[];
}

export type MatchResult = PatternMatch;
export type MatchResults = MatchResult[];

export interface NamedPattern {
    name: string;
    pattern: string | string[];
}

type Patterns = (string | NamedPattern)[];

export class PatternMatcher {
    private worker: RegExpWorker;

    public dispose = () => this.worker.dispose();

    constructor(timeoutMs = 2000) {
        this.worker = new RegExpWorker(timeoutMs);
    }

    async matchPatternsInText(patterns: Patterns, text: string, settings: PatternSettings): Promise<MatchResults> {
        const resolvedPatterns = resolvePatterns(patterns, settings);
        const uniqueRegExpArray = extractUniqueRegExps(resolvedPatterns);

        return execMatchArray(this.worker, text, uniqueRegExpArray).then((r) => pairWithPatterns(r, resolvedPatterns));
    }
}

function pairWithPatterns(execResults: ExecMatchRegExpResults[], patterns: MultiPattern[]): MatchResults {
    const byRegExp: Map<string, RegExpMatches> = new Map(execResults.map((r) => [r.regexp.toString(), r]));

    function mapRegExp(r: RegExp): RegExpMatches {
        return byRegExp.get(r.toString()) || { regexp: r, message: 'not found', elapsedTimeMs: 0 };
    }

    const results: MatchResult[] = patterns.map((p) => ({ name: p.name, matches: p.regexp.map(mapRegExp) }));
    return results;
}

export function isRegExpMatch(m: RegExpMatch | RegExpMatchTimeout): m is RegExpMatch {
    return Array.isArray((m as RegExpMatch).ranges);
}

export function isRegExpMatchTimeout(m: RegExpMatch | RegExpMatchTimeout): m is RegExpMatchTimeout {
    return !isRegExpMatch(m);
}

interface ExecMatchRegExpResult {
    regexp: RegExp;
    elapsedTimeMs: number;
    ranges: Range[];
}

interface ExecMatchRegExpResultTimeout {
    regexp: RegExp;
    elapsedTimeMs: number;
    message: string;
}

type ExecMatchRegExpResults = ExecMatchRegExpResult | ExecMatchRegExpResultTimeout;

function execMatchArray(worker: RegExpWorker, text: string, regexpArray: RegExp[]): Promise<ExecMatchRegExpResults[]> {
    return execMatchRegExpArray(worker, text, regexpArray).catch((e) => {
        if (!isTimeoutError(e)) {
            // eslint-disable-next-line promise/no-return-wrap
            return Promise.reject(e);
        }
        return execMatchRegExpArrayOneByOne(worker, text, regexpArray);
    });
}

function execMatchRegExpArray(worker: RegExpWorker, text: string, regexpArray: RegExp[]): Promise<ExecMatchRegExpResult[]> {
    return worker
        .matchRegExpArray(text, regexpArray)
        .then((r) => r.results.map((result, index) => toExecMatchRegExpArrayResult(result, regexpArray[index])));
}

function execMatchRegExpArrayOneByOne(worker: RegExpWorker, text: string, regexpArray: RegExp[]): Promise<ExecMatchRegExpResults[]> {
    const results = regexpArray.map((regexp) => execMatch(worker, text, regexp));
    return Promise.all(results);
}

function toExecMatchRegExpArrayResult(result: MatchRegExpResult, regexp: RegExp): ExecMatchRegExpResult {
    return {
        regexp,
        ranges: [...result.ranges],
        elapsedTimeMs: result.elapsedTimeMs,
    };
}

function execMatch(worker: RegExpWorker, text: string, regexp: RegExp): Promise<ExecMatchRegExpResults> {
    return worker
        .matchRegExp(text, regexp)
        .then((r) => toExecMatchRegExpArrayResult(r, regexp))
        .catch((e) => toExecMatchRegExpResultTimeout(regexp, e));
}

function toExecMatchRegExpResultTimeout(
    regexp: RegExp,
    error: unknown | TimeoutError,
): ExecMatchRegExpResultTimeout | Promise<ExecMatchRegExpResultTimeout> {
    if (!isTimeoutError(error)) return Promise.reject(error);
    return {
        ...error,
        regexp,
    };
}

function isTimeoutError(e: unknown | TimeoutError): e is TimeoutError {
    return (
        !!e &&
        typeof e === 'object' &&
        'message' in e &&
        typeof e.message === 'string' &&
        'elapsedTimeMs' in e &&
        typeof e.elapsedTimeMs === 'number'
    );
}

interface MatchRegExpResult {
    readonly elapsedTimeMs: number;
    readonly ranges: Iterable<Range>;
}

function resolvePatterns(patterns: Patterns, settings: PatternSettings): MultiPattern[] {
    const knownPatterns = extractPatternsFromSettings(settings);
    const matchingPatterns = patterns.map((pat) => resolvePattern(pat, knownPatterns));
    return matchingPatterns;
}

function resolvePattern(pat: string | NamedPattern, knownPatterns: Map<string, MultiPattern>): MultiPattern {
    if (isNamedPattern(pat)) {
        return namedPatternToMultiPattern(pat);
    }
    return knownPatterns.get(pat) || knownPatterns.get(pat.toLowerCase()) || { name: pat, regexp: [toRegExp(pat, 'g')].filter(isDefined) };
}

function isNamedPattern(pattern: string | NamedPattern): pattern is NamedPattern {
    return typeof pattern !== 'string';
}

function namedPatternToMultiPattern(pat: NamedPattern): MultiPattern {
    const { name, pattern } = pat;
    const regexp = (typeof pattern === 'string' ? [toRegExp(pattern)] : pattern.map((p) => toRegExp(p))).filter(isDefined);
    return { name, regexp };
}

function extractPatternsFromSettings(settings: PatternSettings): Map<string, MultiPattern> {
    const patterns = settings.patterns?.map(mapDef) || [];
    const knownPatterns: [string, MultiPattern][] = patterns.map((pat) => [pat.name.toLowerCase(), pat]);
    const knownRegexp: [string, MultiPattern][] = patterns.map((pat) => [pat.regexp.map((r) => r.toString()).join(','), pat]);
    return new Map(knownPatterns.concat(knownRegexp));
}

function mapDef(pat: RegExpPatternDefinition): MultiPattern {
    const { name, pattern } = pat;
    const patterns = (Array.isArray(pattern) ? pattern.map((r) => toRegExp(r)) : [toRegExp(pattern)]).filter(isDefined);
    // ) => ({ name, patterns: toRegExp(pattern) })
    return { name, regexp: patterns };
}

export function toRegExp(r: RegExp | string, defaultFlags?: string): RegExp | undefined {
    try {
        if (isRegExp(r)) return r;

        const match = r.match(/^\/(.*)\/([gimsuy]*)$/);
        if (match) {
            return new RegExp(match[1], match[2] || undefined);
        }
        return new RegExp(r, defaultFlags);
    } catch (e) {
        logError(format(e));
    }
    return undefined;
}

export function isRegExp(r: RegExp | unknown): r is RegExp {
    return r instanceof RegExp;
}

function* flatten<T>(a: T[][]): Iterable<T> {
    for (const r of a) {
        yield* r;
    }
}

function extractUniqueRegExps(patterns: MultiPattern[]): RegExp[] {
    const nested: [string, RegExp][][] = patterns.map((p) => p.regexp.map((r) => [r.toString(), r]));
    const collection: Map<string, RegExp> = new Map(flatten(nested));
    return [...collection.values()];
}

interface MultiPattern {
    name: string;
    regexp: RegExp[];
}
