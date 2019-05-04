
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
        p = p.trimLeft();
        const matchNeg = p.match(/^!+/);
        const neg = matchNeg && (matchNeg[0].length & 1) && true || false;
        const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), p);
        const reg = mm.makeRe(pattern);
        const fn = (filename: string) => {
            const match = filename.match(reg);
            if (!match) {
                return false;
            }
            // With contains we need to make sure it matches the entire path segment.
            const front = !match.index || filename[match.index -1] === '/';
            const endIndex = match.index! + match[0].length;
            const back = endIndex === filename.length || filename[endIndex] === '/';
            return front && back;
        };
        return { neg, fn };
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

type MutationsToSupportGitIgnore = [RegExp, string];

const mutations: MutationsToSupportGitIgnore[] = [
    [/^!+/, ''],                                   // remove leading !
    [/^[^/#][^/]*$/, '**/{$&,$&/**}',],            // no slashes will match files names or folders
    [/\/$/, '$&**',],                              // if it ends in a slash, make sure matches the folder
    [/^(([^/*])|([*][^*])).*[/]/, '/$&',],         // if it contains a slash, prefix with a slash
];
