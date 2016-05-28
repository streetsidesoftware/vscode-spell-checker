import { expect } from 'chai';
import { calcLevenshteinMatrixAsText } from '../src/levenshtein';


describe('validate Levenshtein', () => {
    it('tests running vs raining', () => {
        const sMatrix = calcLevenshteinMatrixAsText('running', 'raining');
        console.log(sMatrix);
    });
    it('tests aaaaa vs aaaa', () => {
        const sMatrix = calcLevenshteinMatrixAsText('aaaxyzaa', 'xyzaa');
        console.log(sMatrix);
    });
});
