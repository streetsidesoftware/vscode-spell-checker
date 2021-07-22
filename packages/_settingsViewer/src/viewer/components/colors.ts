import { staticColors } from './colorsStatic';
export const themeColors = staticColors.dark;
export const colorsUsed: Set<string> = new Set();
export const backgroundDefault = getColor('editor.background'); // 'var(--vscode-editor-background, #1e1e1e)'; // 'var(--cspell-background, red)'
export const colorPrimary = getColor('button.background'); // 'var(--vscode-button-background, #0e639c)';
export const colorOnPrimary = getColor('button.foreground'); // 'var(--vscode-button-foreground, #ffffff)';
export const colorSecondary = getColor('button.secondaryBackground'); // 'var(--vscode-button-secondaryBackground, #3a3d41)';
export const colorOnSecondary = getColor('button.secondaryForeground'); // 'var(--vscode-button-secondaryForeground, #ffffff)';
export const tabBackground = getColor('button.background');
export const tabForeground = getColor('button.foreground');
export const tabActiveBackground = getColor('button.secondaryBackground');
export const tabActiveForeground = getColor('button.secondaryForeground');
export const textPrimary = getColor('editor.foreground'); // 'var(--vscode-editor-foreground, #bbbbbb)';
export const textSecondary = getColor('descriptionForeground');
export const checkboxBackground = colorSecondary;
export const checkboxForeground = colorOnSecondary;
export const checkboxBackgroundDisabled = colorSecondary;
export const checkboxForegroundDisabled = colorOnSecondary;

export function getColor(name: string): string {
    colorsUsed.add(name);
    const c = themeColors.get(name);
    return c || 'red';
}
