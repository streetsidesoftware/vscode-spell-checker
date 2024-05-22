import type { RegExpPatternDefinition } from '@cspell/cspell-types';
import { isDefined } from '@internal/common-utils';
import { logError } from '@internal/common-utils/log';
import { RegExpWorker, type TimeoutError } from 'regexp-worker';
import { format } from 'util';

import type { PatternSettings } from './api.js';

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

const defaultRegExpFlags = 'gim';

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
    const byRegExp = new Map<string, RegExpMatches>(execResults.map((r) => [r.regexp.toString(), r]));

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
    const patAsRegExp = typeof pat === 'string' ? toRegExp(pat, defaultRegExpFlags)?.toString() : undefined;
    return (
        knownPatterns.get(pat) ||
        knownPatterns.get(pat.toLowerCase()) ||
        (patAsRegExp && knownPatterns.get(patAsRegExp)) || {
            name: pat,
            altPatternNames: [],
            regexp: [toRegExp(pat, defaultRegExpFlags)].filter(isDefined),
        }
    );
}

function isNamedPattern(pattern: string | NamedPattern): pattern is NamedPattern {
    return typeof pattern !== 'string';
}

function namedPatternToMultiPattern(pat: NamedPattern): MultiPattern {
    return mapDef(pat);
}

function extractPatternsFromSettings(settings: PatternSettings): Map<string, MultiPattern> {
    const patterns = settings.patterns?.map(mapDef) || [];
    const knownPatterns = patterns.map((pat) => [pat.name.toLowerCase(), pat] as const);
    const altNames = patterns.flatMap((pat) => pat.altPatternNames.map((name) => [name, pat] as const));
    const knownRegexp = patterns.map((pat) => [pat.regexp.map((r) => r.toString()).join(','), pat] as const);
    return new Map([...knownPatterns, ...altNames, ...knownRegexp]);
}

function mapDef(pat: RegExpPatternDefinition): MultiPattern {
    const { name, pattern } = pat;
    const p = Array.isArray(pattern) ? pattern : [pattern];

    const altPatternNames = new Set([...p.map((r) => toRegExp(r)?.toString()).filter(isDefined), ...p.map((r) => r.toString())]);
    const patternsRegexp = p.map((r) => toRegExp(r, defaultRegExpFlags)).filter(isDefined);
    // ) => ({ name, patterns: toRegExp(pattern) })
    return { name, altPatternNames: [...altPatternNames], regexp: patternsRegexp };
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
    const collection = new Map<string, RegExp>(flatten(nested));
    return [...collection.values()];
}

interface MultiPattern {
    name: string;
    altPatternNames: string[];
    regexp: RegExp[];
}
