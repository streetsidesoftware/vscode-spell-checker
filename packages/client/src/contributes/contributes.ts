import type { IExtensionContributions } from '../vscode/types.js';
import { commands } from './commands.js';

export const contributes: IExtensionContributions = {
    commands,
};
