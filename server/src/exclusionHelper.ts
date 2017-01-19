import * as path from 'path';
import Uri from 'vscode-uri';
import * as minimatch from 'minimatch';

const separator = '/';

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

export function pathToUri(filePath: string): string {
    return Uri.file(filePath).toString();
}

export function generateExclusionFunctionForUri(globs: Glob[], root: string): ExclusionFunction {
    const rootUri = pathToUri(root || '/');
    const fns = globs.map(glob => minimatch.filter(glob, { matchBase: true }));

    function testPath(path: string): boolean {
        return fns.reduce((prev: boolean, fn: ExclusionFunction) => prev || fn(path), false);
    }

    function testPathStepByStep(path: string) {
        const parts = path.split(separator);
        for (let i = 0; i < parts.length; ++i) {
            const p = parts.slice(0, i + 1).join(separator);
            if (testPath(p)) {
                return true;
            }
        }
        return false;
    }

    function testUriPath(uriPath: string): boolean {
        const uri = Uri.parse(uriPath);
        if (uri.scheme !== 'file') {
            return true;
        }

        const relativeRoot = uriPath.slice(0, rootUri.length);
        if (relativeRoot === rootUri) {
            const relativeToRoot = uriPath.slice(rootUri.length);
            return testPathStepByStep(relativeToRoot);
        }

        // the uri is not relative to the root.
        return testPathStepByStep(uri.path);
    }
    return testUriPath;
}
