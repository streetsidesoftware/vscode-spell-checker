import { expect } from 'chai';
import {DictionaryCollection} from '../src/DictionaryCollection';
import {DictionaryAssociation} from '../src/DictionaryAssociation';
import {WordDictionary} from '../src/WordDictionary';
import * as Rx from 'rx';

describe('DictionaryCollection', () => {
    it('tests empty associations', () => {
        const dc = new DictionaryCollection([]);
        const matches = dc.matchingDictionaries({languageId: 'javascript'});
        expect(matches).to.be.length(0);
    });

    it('tests addDictionary', () => {
        const p = new Promise<WordDictionary>((resolve, reject) => {});
        DictionaryCollection.addDictionary('local', p);
        expect(DictionaryCollection.dictionaries.get('local')).to.be.equal(p);
    });

    it('tests associations', () => {
        const p1 = new Promise<WordDictionary>((resolve, reject) => {});
        const p2 = new Promise<WordDictionary>((resolve, reject) => {});
        DictionaryCollection.addDictionary('local', p1);
        DictionaryCollection.addDictionary('@javascript', p2);

        const assocEn = new DictionaryAssociation('*', 'en', 'local');
        const assocJs = new DictionaryAssociation('@(typescript|javascript)?(react)', null, '@javascript');
        const collection = new DictionaryCollection([assocEn, assocJs]);
        const matches = collection.matchingDictionaries({languageId: 'javascript'});
        expect(matches).to.be.length(2);
        expect(matches).to.contain(p1);
        expect(matches).to.contain(p2);
        const matches2 = collection.matchingDictionaries({languageId: 'php'});
        expect(matches2).to.be.length(1);
        expect(matches2).to.contain(p1);
    });
});
