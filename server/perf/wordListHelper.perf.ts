import { expect } from 'chai';

import { loadWordsRx, processWordsRx } from '../src/wordListHelper';
import * as wlh from '../src/wordListHelper';
import * as Rx from 'rx';

const loggingOn = true;

const consoleLog = loggingOn ? console.log : () => {};

const minWordLength = 3;


function diffToMs(diff: [number, number]) {
        const diffSec = diff[0] + diff[1] / 1e9;
        const diffMs = diffSec * 1000;
        return diffMs;
}

interface ScanAcc {
    word?: string;
    startTs?: [number, number];
    elapsedTs?: [number, number];
}

function scanTimer(acc: ScanAcc, word): ScanAcc {
    const ts = process.hrtime(acc.startTs);
    return {
        word,
        startTs: acc.startTs || ts,
        elapsedTs: acc.startTs ? ts : [0, 0]
    };
}

describe('Perf tests for Word List Helper', function() {
    this.timeout(30000);

    it('Loads the English words', () => {

            const rxWords0 = loadWordsRx(__dirname + '/../../dictionaries/wordsEn.txt');
            const rxWords1 = loadWordsRx(__dirname + '/../../dictionaries/wordsEn.txt');

            const p = Rx.Observable.concat([
                processWordsRx(rxWords0)
                    .scan(scanTimer, {})
                    .last()
                    .map(({elapsedTs}) => elapsedTs)
                    .map(diffToMs)
                ,
                wlh.processWordsOld(rxWords1)
                    .scan(scanTimer, {})
                    .last()
                    .map(({elapsedTs}) => elapsedTs)
                    .map(diffToMs)
            ])
            .toArray()
            .toPromise();

            return p.then(([diff0, diff1]) => {
                consoleLog(`Timing: n ${diff0}, o ${diff1}`);
                expect(diff0).to.be.lessThan(diff1);
            });
    });

    it('Loads the PHP words', () => {

            const rxWords0 = loadWordsRx(__dirname + '/../../dictionaries/php.txt');
            const rxWords1 = loadWordsRx(__dirname + '/../../dictionaries/php.txt');

            const p = Rx.Observable.concat([
                wlh.processWordsRx(rxWords0)
                    .scan(scanTimer, {})
                    .last()
                    .map(({elapsedTs}) => elapsedTs)
                    .map(diffToMs)
                ,
                wlh.processWordListLinesRx(rxWords1, minWordLength)
                    .scan(scanTimer, {})
                    .last()
                    .map(({elapsedTs}) => elapsedTs)
                    .map(diffToMs)
            ])
            .toArray()
            .toPromise();

            return p.then(([diff0, diff1]) => {
                consoleLog(`Timing: new - ${diff0}, old - ${diff1} ratio: ${(diff1 / diff0 - 1) * 100}%`);
                expect(diff0).to.be.lessThan(diff1);
            });
    });

});
