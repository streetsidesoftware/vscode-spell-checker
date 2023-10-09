import { format } from 'node:util';

import { logger as internalLogger } from '@internal/common-utils/log.js';
import type { Logger } from 'utils-logger';

export const logger: Logger = {
    log: (...params) => internalLogger.log(format(...params)),
    info: (...params) => internalLogger.info(format(...params)),
    debug: (...params) => internalLogger.debug(format(...params)),
    error: (...params) => internalLogger.error(format(...params)),
    warn: (...params) => internalLogger.warn(format(...params)),
};
