import os from 'node:os';

import * as logger from '@internal/common-utils';
import type { ExtensionContext, TelemetrySender } from 'vscode';

export function createTelemetrySender(context: ExtensionContext): TelemetrySender {
    return new TelemetrySenderImpl(context);
}

const debug = false;

const consoleLog = debug ? logger.consoleLog : () => {};
const consoleError = debug ? logger.consoleError : () => {};

const domain = 'vscode-spell-checker.cspell.org';

// cspell:ignore extversion isnewappinstall remotename sqmid uikind vscodemachineid vscodereleasedate vscodesessionid vscodecommithash vscodeversion

interface CommonDataAttributes {
    'common.devDeviceId': string;
    'common.extname': string; // = 'streetsidesoftware.code-spell-checker'
    'common.extversion': string; // ='4.5.0'
    'common.isnewappinstall': boolean; // =false
    'common.product': string; // ='desktop'
    'common.remotename': string; // ='none'
    'common.sqmid': string; // =''
    'common.uikind': string; // ='desktop'
    'common.vscodecommithash': string; // ='c9d77990917f3102ada88be140d28b038d1dd7c7'
    'common.vscodemachineid': string; // ='4946b3d9bef8d284......4ba601721d9ef786c8f0c06'
    'common.vscodereleasedate': string; // ='2026-01-21T13:52:09.270Z'
    'common.vscodesessionid': string; // ='5055a6...69714240108'
    'common.vscodeversion': string; // ='1.108.2'
}

class TelemetrySenderImpl implements TelemetrySender {
    #context: ExtensionContext;
    osRelease: string;
    osPlatform: string;
    osArchitecture: string;
    osType: string;
    cspellVersion: string;
    extensionVersion: string;

    constructor(context: ExtensionContext) {
        this.#context = context;

        this.osRelease = os.release();
        this.osPlatform = os.platform();
        this.osArchitecture = os.arch();
        this.osType = os.type();
        this.cspellVersion = this.#getCSpellVersion();
        this.extensionVersion = this.#getExtensionVersion();
    }

    sendEventData(eventName: string, data?: Record<string, unknown>): void {
        const attrib = toCommonDataAttributes(data);
        const agent = this.#userAgent(attrib);
        const url = `https://${domain}/${eventName}`;

        const requestData = {
            domain,
            name: 'pageview',
            url,
            props: {
                vscode: attrib['common.vscodeversion'] || '0.0.0',
                platform: os.platform(),
                cspell: this.cspellVersion,
                extension_version: this.extensionVersion,
                is_new_app_install: attrib['common.isnewappinstall'] || false,
            },
            interactive: false,
        };

        consoleLog('Telemetry Event: %s %s %o', eventName, this.#userAgent(attrib), data);

        sendEvent(agent, requestData).catch((e) => {
            consoleError('Failed to send telemetry event %s %o', eventName, e);
        });
    }

    sendErrorData(error: Error, data?: Record<string, unknown>): void {
        consoleError('Telemetry Error: %s %o %o', error.message, data, error);
    }

    flush(): Promise<void> {
        return Promise.resolve();
    }

    #userAgent(attrib: Partial<CommonDataAttributes>): string {
        const extra: string[] = ['code', attrib['common.uikind'], attrib['common.product'], os.platform(), os.arch(), os.release()].filter(
            (v): v is string => !!v,
        );

        const agentSegments: string[] = [
            `VSCode ${attrib['common.vscodeversion'] || '0.0.0'}`,
            `(${extra.join('; ')})`,
            // `CodeSpellChecker/${attrib['common.extversion']}`,
            // `cspell/${this.cspellVersion}`,
        ];

        return agentSegments.join(' ');
    }

    #getExtensionVersion(): string {
        return this.#context.extension.packageJSON.version;
    }

    #getCSpellVersion(): string {
        const found = this.#context.extension.packageJSON.dependencies?.['@cspell/cspell-types'] || '';
        const m = found.match(/(\d+\.\d+\.\d+)/);
        return m?.[0] || '0.0.0';
    }
}

function toCommonDataAttributes(data?: Record<string, unknown>): Partial<CommonDataAttributes> {
    return (data as Partial<CommonDataAttributes>) || {};
}

async function sendEvent(agent: string, payload: unknown): Promise<void> {
    const request = new Request('https://plausible.io/api/event', {
        method: 'POST',
        headers: {
            'User-Agent': agent,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const response = await fetch(request);
    const data = await response.text();
    consoleLog('Response: %o', {
        status: response.status,
        statusText: response.statusText,
        body: data,
        ok: response.ok,
    });
}
