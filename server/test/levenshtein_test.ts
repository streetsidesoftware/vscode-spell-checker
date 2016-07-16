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

    it('tests some words', () => {
        const word = 'creations';
        const words = [
            'create',
            'created',
            'creates',
            'creating',
            'creation',
            'creation\'s',
            'creationism',
            'creationism\'s',
            'creationisms',
            'creationist',
            'creationist\'s',
            'creationists',
            'creations',
            'creative',
            'creative\'s',
            'creatively',
            'creativeness',
            'creativeness\'s',
            'creatives',
        ];
        words.forEach(w => {
            const sMatrix = calcLevenshteinMatrixAsText(word, w);
            console.log(sMatrix);
        });
    });
});
