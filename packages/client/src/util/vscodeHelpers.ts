import type { MessageItem, MessageOptions } from 'vscode';
import { window } from 'vscode';

import { silenceErrors } from './errors';
import { pVoid } from './pVoid';

/**
 * Show an error message.
 *
 * Wrap the promise so it cannot throw an error.
 * @param message - message to show
 * @returns window.showErrorMessage() result or `undefined` if the promise was rejected.
 */
export function pvShowErrorMessage(message: string): Promise<void> {
    return pVoid(window.showErrorMessage(message), 'showErrorMessage helper');
}

/**
 * Show an information message to users. Optionally provide an array of items which will be presented as
 * clickable buttons.
 *
 * @param message The message to show.
 * @param items A set of items that will be rendered as actions in the message.
 * @returns A Promise that resolves to the selected item or `undefined` when being dismissed.
 */
export function showInformationMessage<T extends string>(message: string, ...items: T[]): Promise<T | undefined>;

/**
 * Show an information message to users. Optionally provide an array of items which will be presented as
 * clickable buttons.
 *
 * @param message The message to show.
 * @param options Configures the behavior of the message.
 * @param items A set of items that will be rendered as actions in the message.
 * @returns A Promise that resolves to the selected item or `undefined` when being dismissed.
 */
export function showInformationMessage<T extends string>(message: string, options: MessageOptions, ...items: T[]): Promise<T | undefined>;

/**
 * Show an information message.
 *
 * @see {@link window.showInformationMessage showInformationMessage}
 *
 * @param message The message to show.
 * @param items A set of items that will be rendered as actions in the message.
 * @returns A Promise that resolves to the selected item or `undefined` when being dismissed.
 */
export function showInformationMessage<T extends MessageItem>(message: string, ...items: T[]): Promise<T | undefined>;

/**
 * Show an information message.
 *
 * @see {@link window.showInformationMessage showInformationMessage}
 *
 * @param message The message to show.
 * @param options Configures the behavior of the message.
 * @param items A set of items that will be rendered as actions in the message.
 * @returns A Promise that resolves to the selected item or `undefined` when being dismissed.
 */
export function showInformationMessage<T extends MessageItem>(
    message: string,
    options: MessageOptions,
    ...items: T[]
): Promise<T | undefined>;

export function showInformationMessage(...params: Parameters<typeof window.showInformationMessage>) {
    return silenceErrors(window.showInformationMessage(...params), 'pvShowInformationMessage');
}

export function pvShowInformationMessage(message: string): Promise<void> {
    return pVoid(showInformationMessage(message), 'pvShowInformationMessage');
}
