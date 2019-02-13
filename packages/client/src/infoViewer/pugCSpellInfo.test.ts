import * as t from './pugCSpellInfo';
import * as path from 'path';
import * as fs from 'fs-extra';


const imagesPath = getPathToImages();

function genSetLocal(code: string, enabled: boolean, isGlobal: boolean) {
    return `command:SetLocal?${JSON.stringify([code, enabled, isGlobal])}`;
}

function genOverrideLocal(enable: boolean, isGlobal: boolean) {
    return `command:overrideLocalSetting?${JSON.stringify([enable, isGlobal])}`;
}

function genCommandLink(command: string, paramValues?: any[]) {
    const cmd = `command:${command}?`;
    const params = paramValues ? JSON.stringify(paramValues) : '';
    return encodeURI(cmd + params);
}

const localInfo: t.LocalInfo[] = [
    {
        code: 'en',
        name: 'English',
        enabled: true,
        isInUserSettings: true,
        isInWorkspaceSettings: undefined,
        isInFolderSettings: true,
        dictionaries: ['English', 'Misc'],
    },
    {
        code: 'en-US',
        name: 'English, United States',
        enabled: true,
        isInUserSettings: true,
        isInWorkspaceSettings: undefined,
        isInFolderSettings: undefined,
        dictionaries: ['English'],
    },
    {
        code: 'es',
        name: 'Spanish',
        enabled: true,
        isInUserSettings: false,
        isInWorkspaceSettings: undefined,
        isInFolderSettings: true,
        dictionaries: ['Spanish'],
    },
];

const dictionaries: t.DictionaryEntry[] = [
    { name: 'cpp', description: 'C & CPP Keywords and Function names.'},
    { name: 'es', description: 'Spanish Dictionary (Spain)'},
    { name: 'en-us', description: 'American English Dictionary'},
    { name: 'php', description: 'PHP Keywords and Function names.'},
    { name: 'html', description: 'HTML Keywords'},
    { name: 'typescript', description: 'TypeScript Keywords and Function names.'},
];
const dictionariesForFile = ['en-us', 'html', 'typescript'];
const dictionariesInUse = new Set(dictionariesForFile);
const isDictionaryInUse = (dict: string) => dictionariesInUse.has(dict);

const local: t.LocalSetting = {
    default: 'en',
    user: 'en,de',
    workspace: undefined
};

const info: t.TemplateVariables = {
    filename: 'test.ts',
    fileURI: 'file://test.ts',
    fileEnabled: true,
    dictionariesForFile,
    isDictionaryInUse,
    dictionaries,
    languageEnabled: true,
    languageId: 'typescript',
    spellingErrors: [['one', 1], ['two', 2], ['three', 3], ],
    linkEnableDisableLanguage: 'command:cSpell',
    linkEnableLanguage: 'command:cSpell',
    linkDisableLanguage: 'command:cSpell',
    imagesPath,
    localInfo,
    local,
    availableLocals: ['English'],
    genSetLocal,
    genCommandLink,
    genSelectInfoTabLink,
    genOverrideLocal,
    activeTab: 'FileInfo',
};

describe('Verify Template Renders', () => {
    test('Renders the template to html', async () => {
        const html = t.render(info);
        expect(Object.keys(html)).not.toHaveLength(0);
        expect(html).toEqual(expect.stringContaining('test.ts'));
        expect(html).toEqual(expect.stringContaining('two'));
        expect(html).toEqual(expect.stringContaining(imagesPath));
    });
    test('Renders the template to html again', async () => {
        const html = t.render({
            filename: 'main.cpp',
            fileURI: 'file://main.cpp',
            fileEnabled: true,
            dictionariesForFile,
            isDictionaryInUse,
            dictionaries,
            languageEnabled: true,
            languageId: 'cpp',
            spellingErrors: [['one', 1], ['two', 2], ['three', 3], ['<code>', 5]],
            linkEnableDisableLanguage: 'command:cSpell',
            linkEnableLanguage: 'command:cSpell',
            linkDisableLanguage: 'command:cSpell',
            imagesPath,
            localInfo,
            local,
            availableLocals: ['English'],
            genSetLocal,
            genCommandLink,
            genSelectInfoTabLink,
            genOverrideLocal,
            activeTab: 'IssuesInfo',
        });
        const indexFile = getPathToTemp('index.html');
        await fs.mkdirp(path.dirname(indexFile));
        await fs.writeFile(indexFile, html);
        expect(Object.keys(html)).not.toHaveLength(0);
        expect(html).toEqual(expect.stringContaining('main.cpp'));
        expect(html).toEqual(expect.not.stringContaining('<code>'));
        expect(html).toEqual(expect.stringContaining('&lt;code&gt;'));
    });
});

function getPathToTemp(baseFilename: string) {
    return path.join(__dirname, '..', '..', 'temp', baseFilename);
}

function getPathToImages() {
    return path.join(__dirname, '..', '..', 'images');
}

function genSelectInfoTabLink(tab: string) {
    return '#' + tab;
}
