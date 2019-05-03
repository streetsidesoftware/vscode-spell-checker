
import mm =  require('micromatch');

export class GlobMatcher {
    private matcher: (filename: string) => boolean;
    constructor(readonly patterns: string[], readonly root?: string) {

        this.matcher = buildMatcherFn(patterns, root);
    }

    match(filename: string): boolean {
        return this.matcher(filename);
    }
}

/**
 * This function attempts to emulate .gitignore functionality as much as possible.
 * @param patterns
 * @param root
 */
function buildMatcherFn(patterns: string[], root?: string): (filename: string) => boolean {
    const r = (root || '').replace(/\/$/, '') as string;
    const patternsEx = patterns.map(p => {
        const options: Options = {};
        const matchNeg = p.match(/^!+/);
        const neg = matchNeg && (matchNeg[0].length & 1) && true || false;
        p = p.replace(/^!+/, '');
        gitIgnoreOptions.forEach(([regex, option, replace]) => {
            if (regex.test(p)) {
                Object.assign(options, option);
                if (replace !== undefined) {
                    p = p.replace(regex, replace);
                }
            }
        });
        return { neg, fn: mm.matcher(p, options) };
    });
    const negFns = patternsEx.filter(pat => pat.neg).map(pat => pat.fn);
    const fns = patternsEx.filter(pat => !pat.neg).map(pat => pat.fn);
    return (filename: string) => {
        filename = filename.replace(/^[^/]/, '/$&');
        const offset = r === filename.slice(0, r.length) ? r.length : 0;
        // cspell:ignore fname
        const fname = filename.slice(offset);

        for (const negFn of negFns) {
            if (negFn(fname)) {
                return false;
            }
        }

        for (const fn of fns) {
            if (fn(fname)) {
                return true;
            }
        }
        return false;
    }
}

interface Options extends mm.Options {
    contains?: boolean;
}

type GitIgnoreTestSetOption = [RegExp, Options, string | undefined];

const gitIgnoreOptions: GitIgnoreTestSetOption[] = [
    [/^[^/]+$/, { contains: true },,],  // no slashes will match files names or folders
    [/\/$/, { }, '$&**',],              // if it ends in a slash, make sure matches the folder
    [/^[^/].*[/]/, { }, '/$&',],        // if it contains a slash, prefix with a slash
];
