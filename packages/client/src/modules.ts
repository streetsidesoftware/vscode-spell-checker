import * as di from './di';
import { DictionaryHelper } from './settings/DictionaryHelper';

export function init() {
    di.register('dictionaryHelper', () => new DictionaryHelper(di.get('client')));
}
