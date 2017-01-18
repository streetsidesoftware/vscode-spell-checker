import * as path from 'path';
import * as pug from 'pug';

const cache = new Map<string, pug.compileTemplate>();

const baseDir = __dirname.replace(/(?:out.)?src$/, '');

export const templateDir = path.join(baseDir, 'templates');

export function compile(templateName: string) {
    if (! cache.has(templateName)) {
        const filename = path.join(templateDir, templateName);
        cache.set(templateName, pug.compileFile(filename));
    }
    return cache.get(templateName)!;
}

export function render(templateName: string, params: pug.LocalsObject) {
    const fn = compile(templateName);
    return fn(params);
}
