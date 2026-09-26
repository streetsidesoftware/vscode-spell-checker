import { collectionz } from './collectionz.js';

/** Doc coment: adds the itemz in the shoping cart. */
export function calculteTotl(itemz) {
    // a line coment with a mispeled word
    const msg = 'the totl is recieved';
    const tmpl = `Helo ${itemz.length} itemz`;
    return itemz.reduce((a, b) => a + b, 0);
}
