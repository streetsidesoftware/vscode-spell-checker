const minimatch = require('minimatch');
import * as path from 'path';

export type ExclusionFunction = (filename: string) => boolean;

export type Glob = string;

export interface ExcludeFilesGlobMap {
    [glob: string]: boolean;
}

export function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap) {
    const globs = Object.getOwnPropertyNames(globMap)
        .filter(glob => globMap[glob]);
    return globs;
}


export function generateExclusionFunction(globs: Glob[], root: string): ExclusionFunction {
    const fns = globs.map(glob => minimatch.filter(glob, { matchBase: true }));

    function testPath(path: string) {
        return fns.reduce((prev: boolean, fn: ExclusionFunction) => prev || fn(path), false);
    }

    function recursiveMatch(fullPath: string): boolean {
        // do not match against the root.
        if (fullPath === root) {
            return false;
        }
        const baseDir = path.dirname(fullPath);
        if (baseDir === fullPath) {
            return testPath(fullPath);
        }
        return recursiveMatch(baseDir) || testPath(fullPath);
    }
    return (filename: string) => recursiveMatch(filename);
}
