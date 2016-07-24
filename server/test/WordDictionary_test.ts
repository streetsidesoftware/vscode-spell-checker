import {expect} from 'chai';
import {WordDictionary, has} from '../src/WordDictionary';
import {readWords} from '../src/wordFileReader';
import {normalizeWordList, normalizeKeywordList} from '../src/util/sourceCodeText';

describe('Loading words', function() {
    this.timeout(30000);
    it('Times the loading and normalizing of English Words', () => {
        const rxWords = normalizeWordList(readWords(__dirname + '/../../dictionaries/wordsEn.txt'));
        let startTime = 0;
        let lastTime = 0;
        return rxWords
            .tap(() => { startTime = startTime || Date.now(); })
            // .tap(text => console.log(text.length))
            .toArray()
            .tap(() => lastTime = Date.now())
            .toPromise()
            .then(words => {
                const elapsedTime = lastTime - startTime;
                const promiseTime = Date.now() - lastTime;
                console.log(words.length);
                console.log(`Time: ${elapsedTime}, Promise Time: ${promiseTime}`);
                expect(elapsedTime).to.be.lessThan(5000);
                expect(words.length).to.be.greaterThan(0);
            });
    });
});

describe('Loading words in dictionary', function() {
    this.timeout(30000);
    const rxWords = readWords(__dirname + '/../../dictionaries/wordsEn.txt');
    const dict = WordDictionary.create(rxWords);
    it('Gets the count of words', () => {
        return dict.then(wd => {
            const c = wd.getWordCount();
            console.log(c);
            expect(c).to.be.greaterThan(50000);
        });
    });
});

describe('Validate WordDictionary', function() {
    this.timeout(20000);
    const rxWords = readWords(__dirname + '/../../dictionaries/wordsEn.txt');
    const dict = WordDictionary.create(rxWords);

    it('Validates items can be found', () => {
        return dict.then(dict => {
            expect(dict.has('apples'), 'Has apples').to.be.true;
            expect(dict.suggest('aples').map(sr => sr.word), 'Expects suggestions to contain "apples"').to.contain('apples');
            expect(dict.suggest('aples').map(sr => sr.word), 'Expects suggestions to NOT contain "aples"').to.not.contain('aples');
            expect(dict.suggest('aples').map(sr => sr.word), 'Expects suggestions to NOT contain "banana"').to.not.contain('banana');
            expect(dict.suggest('banana').map(sr => sr.word), 'Expects suggestions to contain "bananas"').to.contain('bananas');
        });
    });
});

describe('Validate `has`', function() {
    this.timeout(10000);
    const rxWordsPhp = normalizeKeywordList(readWords(__dirname + '/../../dictionaries/php.txt'));
    const rxWordsGo = normalizeKeywordList(readWords(__dirname + '/../../dictionaries/go.txt'));
    const dictPhp = WordDictionary.create(rxWordsPhp, a => a);
    const dictGo = WordDictionary.create(rxWordsGo, a => a);
    const dictGoCI = WordDictionary.create(rxWordsGo);

    it('checks for words to exist or not exist in the dictionaries', () => {
        return Promise.all([dictPhp, dictGo, dictGoCI]).then(dicts => {
            const [dictPhp, dictGo, dictGoCI] = dicts;

            expect(dictPhp.has('strcmp'), 'PHP contains `strcmp`').to.be.true;
            expect(dictPhp.has('ArrayAccess::offsetExists'), 'PHP does NOT contain `ArrayAccess::offsetExists`').to.be.false;
            expect(dictPhp.has('offsetExists'), 'PHP contains `offsetExists`').to.be.true;
            expect(dictPhp.has('ArrayAccess'), 'PHP contains `ArrayAccess`').to.be.true;
            expect(dictPhp.has('offset'), 'PHP contains `offset`').to.be.true;
            expect(dictPhp.has('exists'), 'PHP contains `exists`').to.be.true;
            expect(dictGo.has('SizeofSockaddrDatalink'), 'GO contains `SizeofSockaddrDatalink`').to.be.true;
            expect(dictGo.has('sizeofsockaddrdatalink'), 'GO contains `sizeofsockaddrdatalink`').to.be.false;
            expect(dictGo.has('Routing'), 'GO contains `Routing`').to.be.true;
            expect(dictGoCI.has('SizeofSockaddrDatalink'), 'GO CI contains `SizeofSockaddrDatalink`').to.be.true;
            expect(dictGoCI.has('sizeofsockaddrdatalink'), 'GO CI contains `sizeofsockaddrdatalink`').to.be.true;
            expect(has([dictGo, dictPhp], `SizeofSockaddrDatalink`), 'has for multiple dictionaries `SizeofSockaddrDatalink`').to.be.true;
            expect(has([dictGo, dictPhp], `sizeofsockaddrdatalink`), 'has for multiple dictionaries `sizeofsockaddrdatalink`').to.be.false;
        });
    });

});


describe('Case sensitive suggestions', function () {
    this.timeout(10000);
    const rxWordsGo = normalizeKeywordList(readWords(__dirname + '/../../dictionaries/go.txt'));
    const dictGoP = WordDictionary.create(rxWordsGo, a => a);

    it('GO Suggestions for `sizeofsockaddrdatalink`', () => {
        return dictGoP.then(dictGo =>
            expect(dictGo.suggest('sizeofsockaddrdatalink').map(s => s.word)).to.contain('SizeofSockaddrDatalink')
        );
    });
    it('GO Suggestions', () => {
        return dictGoP.then(dictGo => {
            expect(dictGo.suggest('datalink').map(s => s.word)).to.contain('datalink');
            expect(dictGo.suggest('Literal').map(s => s.word)).to.contain('Literal');
            expect(dictGo.suggest('Literal').map(s => s.word)).to.contain('literal');
            expect(dictGo.suggest('literal').map(s => s.word)).to.contain('Literal');
            expect(dictGo.suggest('literal').map(s => s.word)).to.contain('literal');
        });
    });
});

