import {expect} from 'chai';
import { loadWords } from '../src/spellChecker';

describe('tests the speed of using Sets vs Objects', function() {
    this.timeout(2000);
    const pWords = loadWords(__dirname + '/../../dictionaries/wordsEn.txt');

    it('tests character Set', () => {
        let startTime: number[]  = process.hrtime();
        return pWords
            .reduce((a, w) => { a.add(w); return a; }, new Set<string>())
            .tap(() => { console.log('Elapsed: ' + timeDiff(process.hrtime(startTime))); })
            .toPromise();
    });

    it('tests character Object', () => {
        let startTime: number[]  = process.hrtime();
        return pWords
            .reduce((a, w) => { a[w] = true; return a; }, Object.create(null))
            .tap(() => { console.log('Elapsed: ' + timeDiff(process.hrtime(startTime))); })
            .toPromise();
    });

});


function timeDiff([seconds, nanoseconds]: number[]) {
    return seconds + nanoseconds / 1000000000.0;
}