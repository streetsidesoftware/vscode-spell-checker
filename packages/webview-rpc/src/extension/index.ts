import { debug, error, getLogLevel, info, log, setLogLevel, warn } from '../common/logger.js';

export { LogLevel } from '../common/logger.js';
export type { MessageConnection } from './json-rpc.js';
export { createConnectionToWebview } from './json-rpc.js';

export const logger = {
    debug,
    error,
    getLogLevel,
    info,
    log,
    setLogLevel,
    warn,
};
