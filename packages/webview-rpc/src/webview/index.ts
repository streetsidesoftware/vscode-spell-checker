import { debug, error, getLogLevel, info, log, setLogLevel, warn } from '../common/logger.js';

export { LogLevel } from '../common/logger.js';
export type { MessageConnection } from './json-rpc.js';
export { getRpcConnection } from './json-rpc.js';
export type { VSCodeAPI, VSCodeMessageAPI } from './vscode.js';
export { getVsCodeApi, initVsCodeApi } from './vscode.js';

export const logger = {
    debug,
    error,
    getLogLevel,
    info,
    log,
    setLogLevel,
    warn,
};
