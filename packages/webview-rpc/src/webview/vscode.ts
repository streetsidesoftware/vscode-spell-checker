/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebviewApi } from 'vscode-webview';

export interface Disposable {
    dispose: () => void;
}

export interface VSCodeMessageAPI {
    postMessage(message: unknown): void;
    onDidReceiveMessage(listener: (message: any) => void | Promise<void>): Disposable;
}

export interface VSCodeAPI<T> extends VSCodeMessageAPI {
    readonly vsCodeApi: WebviewApi<T> | undefined;
    getState(): T | undefined;
    setState(state: T): T;
}

/**
 * A utility wrapper around the acquireVsCodeApi() function, which enables
 * message passing and state management between the webview and extension
 * contexts.
 *
 * This utility also enables webview code to be run in a web browser-based
 * dev server by using native web browser features that mock the functionality
 * enabled by acquireVsCodeApi.
 */
class VSCodeAPIWrapper<T> implements VSCodeAPI<T> {
    readonly vsCodeApi: WebviewApi<T> | undefined;

    constructor(acquiredVsCodeApi?: WebviewApi<T>) {
        // Check if the acquireVsCodeApi function exists in the current development
        // context (i.e. VS Code development window or web browser)
        if (acquiredVsCodeApi) {
            this.vsCodeApi = acquiredVsCodeApi;
        } else if (typeof acquireVsCodeApi === 'function') {
            this.vsCodeApi = acquireVsCodeApi();
        }
    }

    /**
     * Post a message (i.e. send arbitrary data) to the owner of the webview.
     *
     * @remarks When running webview code inside a web browser, postMessage will instead
     * log the given message to the console.
     *
     * @param message Arbitrary data (must be JSON serializable) to send to the extension context.
     */
    public postMessage(message: unknown) {
        if (this.vsCodeApi) {
            this.vsCodeApi.postMessage(message);
        } else {
            console.log(message);
        }
    }

    /**
     * Get the persistent state stored for this webview.
     *
     * @remarks When running webview source code inside a web browser, getState will retrieve state
     * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
     *
     * @return The current state or `undefined` if no state has been set.
     */
    public getState(): T | undefined {
        if (this.vsCodeApi) {
            return this.vsCodeApi.getState();
        } else {
            const state = localStorage.getItem('vscodeState');
            return state ? JSON.parse(state) : undefined;
        }
    }

    /**
     * Set the persistent state stored for this webview.
     *
     * @remarks When running webview source code inside a web browser, setState will set the given
     * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
     *
     * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
     * using {@link getState}.
     *
     * @return The new state.
     */
    public setState(newState: T): T {
        if (this.vsCodeApi) {
            return this.vsCodeApi.setState(newState);
        } else {
            localStorage.setItem('vscodeState', JSON.stringify(newState));
            return newState;
        }
    }

    public onDidReceiveMessage(listener: (message: any) => void | Promise<void>): Disposable {
        window.addEventListener('message', listener);
        return { dispose: () => window.removeEventListener('message', listener) };
    }
}

// class singleton to prevent multiple invocations of acquireVsCodeApi.
let vscode: VSCodeAPIWrapper<any> | undefined;

/**
 * Initialize the WebviewApi singleton.
 * @param acquiredVsCodeApi - optional WebviewApi returned by acquireVsCodeApi, if not specified, `acquireVsCodeApi` will be called.
 * @returns VSCodeAPIWrapper
 */
export function initVsCodeApi<T>(acquiredVsCodeApi?: WebviewApi<T>): VSCodeAPIWrapper<T> {
    return getVsCodeApi(acquiredVsCodeApi);
}

/**
 * Get the api singleton.
 * @param acquiredVsCodeApi - optional WebviewApi returned by acquireVsCodeApi, not needed if `initVsCodeApi`
 *    has been called or `acquireVsCodeApi` has not been called.
 * @returns a VSCodeAPIWrapper
 */
export function getVsCodeApi<T>(acquiredVsCodeApi?: WebviewApi<T>): VSCodeAPIWrapper<T> {
    if (vscode) return vscode;
    const api = new VSCodeAPIWrapper<T>(acquiredVsCodeApi);
    vscode = api;
    return api;
}
