import { logger } from '@internal/common-utils/log';

import * as di from './di.mjs';
import { DictionaryHelper } from './settings/DictionaryHelper.mjs';

export function init(): void {
    logger.setConnection({ console, onExit: () => undefined });
    di.register('dictionaryHelper', () => new DictionaryHelper(di.get('client')));
}
