import * as di from './di';
import { DictionaryHelper } from './settings/DictionaryHelper';

export function init(): void {
    di.register('dictionaryHelper', () => new DictionaryHelper(di.get('client')));
}
