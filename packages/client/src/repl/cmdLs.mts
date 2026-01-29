import type { CancellationToken, Uri } from 'vscode';
import { FileType } from 'vscode';

import { toError } from '../util/errors.js';
import { combine, dim, green, red, yellow } from './ansiUtils.mjs';
import type { ExDirEntry } from './fsUtils.mjs';
import { globSearch, readDirStats, readStatOrError, readStatsForFiles, relativePath } from './fsUtils.mjs';
import { normalizePatternBase } from './globUtils.mjs';

interface CmdLsOptions {
    cwd: Uri;
    log: typeof console.log;
    dirSuffix?: string;
    cancellationToken?: CancellationToken;
}

const identity = <T,>(x: T) => x;

export async function cmdLs(paths: string[] | undefined, options: CmdLsOptions): Promise<void> {
    const { log, dirSuffix = '/' } = options;
    for await (const entry of ls(paths, options.cwd, options.cancellationToken)) {
        const [name, stat] = entry;
        const isError = stat instanceof Error;
        if (isError) {
            log(red('Error: ') + `${yellow(name)}: No such file or directory`);
            continue;
        }
        const fileType = stat.type;
        const suffix = fileType & FileType.Directory ? dirSuffix : '';

        let color = fileType & FileType.SymbolicLink ? yellow : fileType & FileType.Directory ? green : identity;
        if (name.startsWith('.')) {
            color = combine(color, dim);
        }

        log(color(name + suffix));
    }
}

async function* ls(paths: string[] | undefined, cwd: Uri, cancellationToken: CancellationToken | undefined): AsyncGenerator<ExDirEntry> {
    const collation = new Intl.Collator(undefined, { numeric: true, sensitivity: 'variant' });

    if (!paths?.length) {
        yield* readDirStats(cwd, false, cancellationToken);
        return;
    }

    for (const path of paths) {
        if (cancellationToken?.isCancellationRequested) {
            return;
        }
        const [glob, base] = normalizePatternBase(path, cwd);

        if (!glob) {
            const stats = await readStatOrError(base);
            if (stats instanceof Error) {
                yield [path, stats];
                continue;
            }
            if (stats.type & FileType.Directory) {
                yield* readDirStats(base, false, cancellationToken);
                continue;
            }
            yield [path, stats];
            continue;
        }

        try {
            const uris = await globSearch(glob, base, undefined, undefined, cancellationToken);

            uris.sort((a, b) => collation.compare(a.path, b.path));

            for await (const [uri, stats] of readStatsForFiles(uris, cancellationToken)) {
                yield [relativePath(cwd, uri), stats];
            }
        } catch (e) {
            yield [path, toError(e)];
        }
    }
}
