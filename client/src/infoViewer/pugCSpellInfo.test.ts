import { expect } from 'chai';
import * as t from './pugCSpellInfo';
import * as path from 'path';
import * as fs from 'fs-extra';


const imagesPath = getPathToImages();

function genSetLocal(code: string, enabled: boolean, isGlobal: boolean) {
    return `command:SetLocal?${JSON.stringify([code, enabled, isGlobal])}`;
}

const localInfo: t.LocalInfo[] = [
    {
        code: 'en',
        name: 'English',
        enabled: true,
        isInUserSettings: true,
        isInWorkspaceSettings: undefined,
        dictionaries: ['English', 'Misc'],
    },
    {
        code: 'en-US',
        name: 'English, United States',
        enabled: true,
        isInUserSettings: true,
        isInWorkspaceSettings: undefined,
        dictionaries: ['English'],
    },
    {
        code: 'es',
        name: 'Spanish',
        enabled: true,
        isInUserSettings: false,
        isInWorkspaceSettings: undefined,
        dictionaries: ['Spanish'],
    },
];

const dictionariesForFile = ['English', 'Html', 'Typescript'];

const info: t.TemplateVariables = {
    useDarkTheme: true,
    filename: 'test.ts',
    fileEnabled: true,
    dictionariesForFile,
    languageEnabled: true,
    languageId: 'typescript',
    spellingErrors: [['one', 1], ['two', 2], ['three', 3], ],
    linkEnableDisableLanguage: 'command:cSpell',
    linkEnableLanguage: 'command:cSpell',
    linkDisableLanguage: 'command:cSpell',
    imagesPath,
    localInfo,
    local: ['English'],
    availableLocals: ['English'],
    genSetLocal,
    genSelectInfoTabLink,
    activeTab: 'FileInfo',
};

describe('Verify Template Renders', () => {
    it('Renders the template to html', async () => {
        const html = t.render(info);
        expect(html).to.not.be.empty;
        expect(html).to.contain('test.ts');
        expect(html).to.contain('<li>two (2)</li>');
        expect(html).to.contain(imagesPath);
    });
    it('Renders the template to html again', async () => {
        const html = t.render({
            useDarkTheme: true,
            filename: 'main.cpp',
            fileEnabled: true,
            dictionariesForFile,
            languageEnabled: true,
            languageId: 'cpp',
            spellingErrors: [['one', 1], ['two', 2], ['three', 3], ['<code>', 5]],
            linkEnableDisableLanguage: 'command:cSpell',
            linkEnableLanguage: 'command:cSpell',
            linkDisableLanguage: 'command:cSpell',
            imagesPath,
            localInfo,
            local: ['English'],
            availableLocals: ['English'],
            genSetLocal,
            genSelectInfoTabLink,
            activeTab: 'FileInfo',
        });
        expect(html).to.not.be.empty;
        expect(html).to.contain('main.cpp');
        expect(html).to.not.contain('<code>');
        expect(html).to.contain('&lt;code&gt;');
        const indexFile = getPathToTemp('index.html');
        await fs.mkdirp(path.dirname(indexFile));
        await fs.writeFile(indexFile, html);
    });
});

function getPathToTemp(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'temp', baseFilename);
}

function getPathToImages() {
    return path.join(__dirname, '..', '..', 'images');
}

function genSelectInfoTabLink(tab) {
    return '#' + tab;
}
