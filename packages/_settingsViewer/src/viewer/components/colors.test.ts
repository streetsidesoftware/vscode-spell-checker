import * as colors from './colors';
import * as colorsStatic from './colorsStatic';
import * as path from 'path';
import * as fs from 'fs';
import { getCssVar, Theme } from '../VSCodeColors/vscodeColors';

const generateColors = false;

describe('Ensure colors match', () => {
    if (generateColors) {
        generateColorsStatic();
    }

    colors.colorsUsed.forEach((name) => {
        test(`Color: ${name}`, () => {
            const dark = colorsStatic.staticColors.dark.get(name);
            expect(dark).toBe(getCssVar(name, 'dark'));
            expect(dark).toBeDefined();
            const light = colorsStatic.staticColors.light.get(name);
            expect(light).toBe(getCssVar(name, 'light'));
            expect(light).toBeDefined();
        });
    });
});

/**
 * Generate the colors in `colorsStatic.ts`
 * The colors are generated because we do NOT want to include VS Code Colors
 * in the Webpack bundle.
 */
function generateColorsStatic() {
    const fileName = path.join(__dirname, 'colorsStatic.ts');
    const dark = calcColors('dark').join(',\n    ');
    const light = calcColors('light').join(',\n    ');

    const content = `
/** Note this file is generated in \`colors.test.ts\` */
export const staticColors = {
    dark: new Map([
        ${dark}
    ]),
    light: new Map([
        ${light}
    ]),
};
`;
    fs.writeFileSync(fileName, content, 'utf8');
}

function calcColors(theme: Theme): string[] {
    const result = [...colors.colorsUsed]
        .map((name) => [name, getCssVar(name, theme)] as [string, string | undefined])
        .filter(([, value]) => !!value)
        .map(([key, value]) => `['${key}', '${value}']`);
    return result;
}
