'use strict';

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
    description: 'js-config example',
    languageSettings: [],
    allowCompoundWords: false,
    dictionaryDefinitions: [
        {
            name: 'custom-terms',
            path: './custom-terms.txt',
            scope: 'workspace',
            addWords: true,
        },
    ],
    dictionaries: ['custom-terms'],
};

module.exports = cspell;
