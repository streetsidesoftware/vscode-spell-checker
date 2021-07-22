'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./.pnp.js').setup();

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
    description: 'Make cspell Yarn 2 PNP aware',
    import: ['@cspell/dict-scientific-terms-us/cspell-ext.json'],
};

module.exports = cspell;
