import { format } from 'node:util';

import { logger as internalLogger } from '@internal/common-utils/log';
import { createLogger } from 'utils-logger';

export function createPrecisionLogger() {
    return createLogger({
        log: (...params) => internalLogger.log(format(...params)),
        info: (...params) => internalLogger.info(format(...params)),
        debug: (...params) => internalLogger.debug(format(...params)),
        error: (...params) => internalLogger.error(format(...params)),
        warn: (...params) => internalLogger.warn(format(...params)),
    });
}
