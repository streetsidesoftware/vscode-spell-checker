import { performance } from '../util/perf';
performance.mark('pugHelper.ts');
import * as path from 'path';
performance.mark('pugHelper.ts 1');

const cache = new Map<string, any>();

const baseDir = __dirname.replace(/(?:out.)?src.*$/, '');

export const templateDir = path.join(baseDir, 'templates');

export function compile(templateName: string) {
    if (! cache.has(templateName)) {
        performance.mark('pugHelper.ts compile');
        const pug = require('pug');
        const filename = path.join(templateDir, templateName);
        cache.set(templateName, pug.compileFile(filename));
        performance.mark('pugHelper.ts compile done');
        performance.measure(`pugHelper.ts compile: ${templateName}`, 'pugHelper.ts compile', 'pugHelper.ts compile done');
    }
    return cache.get(templateName)!;
}

export function render(templateName: string, params: any) {
    const fn = compile(templateName);
    return fn({...params, templateDir});
}

performance.mark('pugHelper.ts done.');
