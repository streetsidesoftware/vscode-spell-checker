import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';
import type { GlobPatternNormalized } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';
import { calcIgnorePathGlobs, isIgnoredByPresets } from 'cspell-lib';
import type { URI as Uri } from 'vscode-uri';

import { toDirURL, uriToGlobPath, uriToUrl } from './urlUtil.mjs';

export interface IgnorePathPresetMatch {
    /** The preset that skips the file, such as `ignorePathPresets.git`. */
    name: string | undefined;
    glob: GlobDef;
}

/**
 * Find the enabled `ignorePathPresets` that skips a file.
 * @returns the match, or `undefined` when no preset skips the file.
 */
export type IgnorePathPresetsMatcher = (uri: Uri) => IgnorePathPresetMatch | undefined;

// cspell-lib names the git preset `ignorePathPresets.git` in the globs it returns.
const gitPresetName = 'ignorePathPresets.git';

/**
 * Create a matcher for the enabled `ignorePathPresets`.
 *
 * The nested worktrees are read from the repository's records when the matcher is created.
 *
 * @param settings - the settings with `ignorePathPresets`.
 * @param rootUri - the folder the presets apply to. Files outside it are never skipped.
 */
export async function createIgnorePathPresetsMatcher(settings: CSpellSettings, rootUri: string): Promise<IgnorePathPresetsMatcher> {
    const root = toDirURL(uriToUrl(rootUri));
    const globs = await calcIgnorePathGlobs(settings, root);
    const matcher = new GlobMatcher(globs, root.href);

    return (uri) => {
        const match = matcher.matchEx(uriToGlobPath(uri));
        if (match.matched) {
            const pattern = match.pattern as GlobPatternNormalized;
            return { name: pattern.source, glob: { glob: pattern.rawGlob, root: pattern.rawRoot } };
        }
        // The globs leave out the `.git` file of a worktree or a submodule; cspell-lib checks it by name.
        if (isIgnoredByPresets(uriToUrl(uri), root, settings)) {
            return { name: gitPresetName, glob: { glob: '.git', root: root.href } };
        }
        return undefined;
    };
}
