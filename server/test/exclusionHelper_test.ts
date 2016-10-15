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
            '~/project/node_modules',
            '~/project/node_modules/test/test.js',
        ];
        const fn = generateExclusionFunction(globs);

        filesMatching.forEach(filepath => {
            const r = fn(filepath);
            expect(r).to.be.true;
        });
    });
});