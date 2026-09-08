import type { IExtensionContributions } from '../vscode/types.ts';
import { commands } from './commands.ts';

export type { IExtensionContributions } from '../vscode/types.ts';

export const contributes: IExtensionContributions = {
    commands,
};
