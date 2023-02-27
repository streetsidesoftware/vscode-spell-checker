'use strict';
// eslint-disable-next-line node/no-missing-require, node/no-unpublished-require
require('./.pnp.js').setup();

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
    description: 'Make cspell Yarn 2 PNP aware',
    import: ['@cspell/dict-scientific-terms-us/cspell-ext.json'],
};

module.exports = cspell;
