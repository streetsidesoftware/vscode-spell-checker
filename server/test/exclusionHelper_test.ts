import { expect } from 'chai';
import {
    extractGlobsFromExcludeFilesGlobMap,
    generateExclusionFunction
} from '../src/exclusionHelper';
const minimatch = require('minimatch');
import * as path from 'path';


describe('Verify Exclusion Helper functions', function() {

    it('checks extractGlobsFromExcludeFilesGlobMap', function() {
        const excludeDef = {
            '**/node_modules': true,
            '**/typings': true,
        };
        expect(extractGlobsFromExcludeFilesGlobMap(excludeDef), 'get list of globs').is.deep.equal(['**/node_modules', '**/typings']);
    });

    it('Test the generated matching function', function() {
        const globs = [
            '**/node_modules',
            '**/typings',
            '.vscode',
        ];
        const filesMatching = [
            '~/project/myProject/node_modules',
            '~/project/myProject/node_modules/test/test.js',
            '~/project/myProject/.vscode/cSpell.json',
        ];
        const fn = generateExclusionFunction(globs, '~/project/myProject');

        filesMatching.forEach(filepath => {
            const r = fn(filepath);
            expect(r).to.be.true;
        });
    });

    it('Test against generated files', function() {
        const globs = [
            'debug:/**',
            '**/*.rendered',
        ];
        const files = [
            'debug://internal/1014/extHostCommands.ts',
            '~/project/myProject/README.md.rendered',
        ];

        const fn = generateExclusionFunction(globs, '~/project/myProject');

        files.forEach(filepath => {
            const r = fn(filepath);
            expect(r).to.be.true;
        });
    });
});