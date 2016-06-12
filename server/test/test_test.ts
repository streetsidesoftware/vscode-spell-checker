import {expect} from 'chai';
import * as Validator from '../src/validator';
import * as Rx from 'rx';

describe('Sequencing', function () {
    this.timeout(10000);

    it('checks buffer', () => {
        return Rx.Observable.timer(0, 50)
            .buffer(function () {
                console.log('close fn');
                return Rx.Observable.timer(125);
            })
            .take(3)
            .tap(x => { console.log('Next: %s', x); })
            .toArray()
            .toPromise();

    });

/*
    it('tries group-by', () => {
        const codes = [
            { url: 'doc1', text: 'a'},
            { url: 'doc1', text: 'ap'},
            { url: 'doc1', text: 'app'},
            { url: 'doc2', text: 'b'},
            { url: 'doc1', text: 'appl'},
            { url: 'doc2', text: 'ba'},
            { url: 'doc1', text: 'apple'},
            { url: 'doc2', text: 'ban'},
            { url: 'doc1', text: 'apples'},
            { url: 'doc2', text: 'bana'},
            { url: 'doc1', text: 'applesa'},
            { url: 'doc2', text: 'banan'},
            { url: 'doc1', text: 'applesau'},
            { url: 'doc2', text: 'banana'},
            { url: 'doc1', text: 'applesauc'},
            { url: 'doc2', text: 'banana '},
            { url: 'doc1', text: 'applesauce'},
        ];

        const source = Rx.Observable
            .for(codes, function (x, i) {
                console.log('A0 -> ' + Date.now());
                const scale = i === 7 ? 5 : 1;
                return Rx.Observable.return(x).delay(scale * 50);
            })
            .tap(x => { console.log('A1 -> ' + Date.now()); })
            .groupByUntil(
                x => x.url,
                x => x,
                x => {
                console.log('A2 -> ' + Date.now());
                return Rx.Observable.timer(250);
            });

        return source
            .tap(obs => {
                // Print the count
                console.log('B --> ' + Date.now());
                obs.last().subscribe(function (x) { console.log('Word: ' + Date.now() + ' ' + x.text); });
            })
            .toArray()
            .toPromise();
    });
*/
});