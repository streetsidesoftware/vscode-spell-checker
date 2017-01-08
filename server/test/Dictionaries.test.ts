import { expect } from 'chai';
import * as Dictionaries from '../src/Dictionaries';
import * as fsp from 'fs-promise';
import { getDefaultSettings } from '../src/DefaultSettings';

const defaultSettings = getDefaultSettings();

describe('Validate Dictionaries', () => {
    it('expects default to not be empty', () => {
        const mapDefs = Dictionaries.filterDictDefsToLoad(['php', 'wordsEn', 'unknown'], defaultSettings.dictionaryDefinitions!);
        const files = mapDefs.map(a => a[1]).map(def => def.path!);
        expect(files.filter(a => a.includes('php.txt'))).to.be.lengthOf(1);
        expect(files.filter(a => a.includes('wordsEn.txt'))).to.be.lengthOf(1);
        expect(files.filter(a => a.includes('unknown'))).to.be.empty;
        // console.log(mapDefs);
    });

    it('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions!;
        const dictIds = defaultDicts.map(def => def.name);
        const mapDefs = Dictionaries.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions!);
        const access = mapDefs
            .map(p => p[1])
            .map(def => def.path!)
            .map(path => fsp.access(path));
        return Promise.all(access);
    });
});