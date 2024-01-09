import { logger } from '@internal/common-utils/log';

import * as di from './di';
import { DictionaryHelper } from './settings/DictionaryHelper';

export function init(): void {
    logger.setConnection({ console, onExit: () => undefined });
    di.register('dictionaryHelper', () => new DictionaryHelper(di.get('client')));
}
