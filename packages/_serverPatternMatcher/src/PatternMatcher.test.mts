import assert from 'assert';
import { getDefaultSettings } from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import type { Range } from './PatternMatcher.js';
import { isRegExpMatch, isRegExpMatchTimeout, PatternMatcher } from './PatternMatcher.js';

const settings = {
    patterns: [],
    ...getDefaultSettings(),
};

const defaultTimeout = 5000;
const jestTimeout = 20000;

describe('Validate PatternMatcher', () => {
    testMatcher('email', async (matcher) => {
        const result = await matcher.matchPatternsInText(['email'], sampleText, settings);
        const r = mapResults(result);
        expect(r.get('Email')).toBeDefined();
        const matchedEmails = r.get('Email');
        expect(matchedEmails?.matches).toHaveLength(1);
        const m = matchedEmails?.matches[0];
        expect(m && isRegExpMatchTimeout(m)).toBe(false);
        expect(m && isRegExpMatch(m)).toBe(true);
        if (m && isRegExpMatch(m)) {
            const emails = m.ranges.map((r) => extract(sampleText, r));
            expect(emails).toEqual(['<info@example.com>']);
        }
    });

    testMatcher('patterns', async (matcher) => {
        const result = await matcher.matchPatternsInText(
            [{ name: 'email', pattern: /(?<![\w.+\-_])[\w.+\-_]+@[\w.+\-_]+/g.toString() }],
            sampleText,
            settings,
        );
        const r = mapResults(result);
        expect(r.get('email')).toBeDefined();
        const matchedEmailsResult = r.get('email');
        expect(matchedEmailsResult?.matches).toHaveLength(1);
        const matchedEmails = matchedEmailsResult?.matches[0];
        assert(matchedEmails);
        expect(isRegExpMatchTimeout(matchedEmails)).toBe(false);
        expect(isRegExpMatch(matchedEmails)).toBe(true);
        if (isRegExpMatch(matchedEmails)) {
            const emails = matchedEmails.ranges.map((r) => extract(sampleText, r));
            expect(emails).toEqual(['info@example.com']);
        }
    });

    testMatcher('regexp match everything', async (matcher) => {
        const result = await matcher.matchPatternsInText([/.*/.toString()], sampleText, settings);
        const r = mapResults(result);
        expect(r.get('Everything')).toBeDefined();
        const matchedResults = r.get('Everything');
        assert(matchedResults);
        expect(matchedResults.matches).toHaveLength(1);
        const matches = matchedResults.matches[0];
        expect(isRegExpMatchTimeout(matches)).toBe(false);
        expect(isRegExpMatch(matches)).toBe(true);
        if (isRegExpMatch(matches)) {
            const matchedText = matches.ranges.map((r) => extract(sampleText, r));
            expect(matchedText).toEqual(['']);
        }
    });

    testMatcher(
        'timeout',
        async (matcher) => {
            const slowRegexp = '(x+x+)+y'; // lgtm[js/redos]
            const result = await matcher.matchPatternsInText([slowRegexp], sampleText, settings);
            const r = mapResults(result);
            expect(r.get(slowRegexp)).toBeDefined();
            const matchedResults = r.get(slowRegexp);
            assert(matchedResults);
            expect(matchedResults.matches).toHaveLength(1);
            const matches = matchedResults.matches[0];
            expect(isRegExpMatchTimeout(matches)).toBe(true);
            expect(isRegExpMatch(matches)).toBe(false);
        },
        1000,
    );
});

function testMatcher<T = void>(name: string, fn: (matcher: PatternMatcher) => Promise<T>, timeoutMs = defaultTimeout) {
    test(name, run(fn, timeoutMs), Math.max(timeoutMs * 4, jestTimeout));
}

function run<T = void>(fn: (matcher: PatternMatcher) => Promise<T>, timeoutMs: number): () => Promise<T> {
    const matcher = new PatternMatcher(timeoutMs);
    return () => fn(matcher).finally(() => matcher.dispose());
}

function mapResults<T extends { name: string }>(values: T[]): Map<string, T> {
    return new Map(values.map((v) => [v.name, v]));
}

function extract(text: string, range: Range) {
    return text.slice(range[0], range[1]);
}

const sampleText = `
    Please email: <info@example.com>

    Quote: "All good things must..."

    # Regexp: /(x+x+)+y/ exhibits catastrophic backtracking on the following string:
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`;
