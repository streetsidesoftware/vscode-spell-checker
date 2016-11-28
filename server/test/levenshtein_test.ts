import { expect } from 'chai';
import { calcLevenshteinMatrixAsText, calcLevenshteinMatrix, levenshteinMatrixAsText } from '../src/levenshtein';


describe('validate Levenshtein', () => {
    it('tests running vs raining', () => {
        const matrix = calcLevenshteinMatrix('running', 'raining');
        // console.log(levenshteinMatrixAsText(matrix));
        expect(levenshteinMatrixAsText(matrix)).to.equal(calcLevenshteinMatrixAsText('running', 'raining'));
    });

    /*
    it('tests aaaaa vs aaaa', () => {
        const matrix = calcLevenshteinMatrix('aaaxyzaa', 'xyzaa');
        console.log(levenshteinMatrixAsText(matrix));
    });
    */
});
