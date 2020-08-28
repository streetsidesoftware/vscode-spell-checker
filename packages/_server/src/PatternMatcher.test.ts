import { getDefaultSettings } from 'cspell-lib';
import { PatternMatcher, Range, isPatternMatchTimeout, isPatternMatch } from './PatternMatcher';

const settings = {
    patterns: [],
    ...getDefaultSettings()
};

describe('Validate PatternMatcher', () => {
    testMatcher('email', async (matcher) => {
        const result = await matcher.matchPatternsInText(['email'], sampleText, settings);
        const r = mapResults(result);
        expect(r.get('Email')).toBeDefined();
        const matchedEmails = r.get('Email')!;
        expect(isPatternMatchTimeout(matchedEmails)).toBe(false);
        expect(isPatternMatch(matchedEmails)).toBe(true);
        if (isPatternMatch(matchedEmails)) {
            const emails = matchedEmails.ranges.map(r => extract(sampleText, r));
            expect(emails).toEqual(['<info@example.com>']);
        }
    });

    testMatcher('patterns', async (matcher) => {
        const result = await matcher.matchPatternsInText([{ name: 'email', regexp: (/(?<![\w.+\-_])[\w.+\-_]+@[\w.+\-_]+/g).toString()}], sampleText, settings);
        const r = mapResults(result);
        expect(r.get('email')).toBeDefined();
        const matchedEmails = r.get('email')!;
        expect(isPatternMatchTimeout(matchedEmails)).toBe(false);
        expect(isPatternMatch(matchedEmails)).toBe(true);
        if (isPatternMatch(matchedEmails)) {
            const emails = matchedEmails.ranges.map(r => extract(sampleText, r));
            expect(emails).toEqual(['info@example.com']);
        }
    });
});

function testMatcher<T = void>(name: string, fn: (matcher: PatternMatcher) => Promise<T>) {
    test(name, run(fn));
}

function run<T = void>(fn: (matcher: PatternMatcher) => Promise<T>): () => Promise<T> {
    const matcher = new PatternMatcher();
    return () => fn(matcher).finally(() => matcher.dispose());
}

function mapResults<T extends {name: string}>(values: T[]): Map<string, T> {
    return new Map(values.map(v => [v.name, v]));
}

function extract(text: string, range: Range) {
    return text.slice(range[0], range[1])
}

const sampleText = `
    Please email: <info@example.com>

    Quote: "All good things must..."

`;
