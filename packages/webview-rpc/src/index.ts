import { debug, error, getLogLevel, info, log, setLogLevel, warn } from './common/logger.js';

export {
    type ApplyNotificationAPI,
    type ApplyRequestAPI,
    type ClientAPIDef,
    type ClientSideMethods,
    createClientApi,
    createServerApi,
    type RpcAPI,
    type ServerAPIDef,
    type ServerSideMethods,
} from './common/json-rpc-api.js';
export { LogLevel } from './common/logger.js';

export const logger = {
    debug,
    error,
    getLogLevel,
    info,
    log,
    setLogLevel,
    warn,
};
