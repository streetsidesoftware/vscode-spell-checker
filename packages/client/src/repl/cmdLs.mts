import type { Uri } from 'vscode';

interface CmdLsOptions {
    cwd: Uri;
    log: typeof console.log;
}

export function cmdLs(_paths: string[] | undefined, _options: CmdLsOptions) {}
