import {Trie, TrieMap, TrieNode} from './Trie';

const baseCost = 100;
const swapCost = 75;
const postSwapCost = swapCost - baseCost;

export interface SuggestionResult {
    word: string;
    cost: number;
}

const maxNumChanges = 4;
const defaultNumberOfSuggestions = 5;


export function suggest(trie: Trie, word: string, numSuggestions: number = defaultNumberOfSuggestions): SuggestionResult[] {
    return suggestA(trie, word, numSuggestions);
}

export function suggestA(
        trie: Trie, word: string,
        numSuggestions: number = defaultNumberOfSuggestions
    ): SuggestionResult[] {
    let costLimit = Math.min(baseCost * word.length / 2, baseCost * maxNumChanges);

    const sugs: SuggestionResult[] = [];

    const matrix: number[][] = [[]];
    const x = ' ' + word;
    const mx = x.length - 1;
    const curSug: string[] = [''];

    for (let i = 0; i <= mx; ++i) {
        matrix[0][i] = i * baseCost;
    }

    function processTrie(trie: TrieNode, d: number) {
        const bc = baseCost;
        const psc = postSwapCost;
        let subCost, curLetter;
        const { w, c } = trie;
        if (! w) {
            const cost = matrix[d - 1][mx];
            if (cost <= costLimit) {
                emitSug({ word: curSug.slice(1, d).join(''), cost });
            }
        } else {
            curSug[d] = w;
            const lastSugLetter = curSug[d - 1];
            matrix[d] = matrix[d] || [];
            matrix[d][0] = matrix[d - 1][0] + bc;
            let lastLetter = x[0];
            let min = matrix[d][0];
            for (let i = 1; i <= mx; ++i) {
                curLetter = x[i];
                subCost =
                    (w === curLetter)
                    ? 0 : (curLetter === lastSugLetter ? (w === lastLetter ? psc : bc) : bc);
                matrix[d][i] = Math.min(
                    matrix[d - 1][i - 1] + subCost, // substitute
                    matrix[d - 1][i] + bc,    // insert
                    matrix[d][i - 1] + bc     // delete
                );
                min = Math.min(min, matrix[d][i]);
                lastLetter = curLetter;
            }
            if (min <= costLimit) {
                processTries(c, d + 1);
            }
        }
    }

    function processTries(tries: TrieMap | undefined, d: number) {
        if (tries) {
            for (const trie of tries.values()) {
                processTrie(trie, d);
            }
        }
    }

    function emitSug(sug: SuggestionResult) {
        sugs.push(sug);
        if (sugs.length > numSuggestions) {
            sugs.sort((a, b) => a.cost - b.cost);
            sugs.length = numSuggestions;
            costLimit = sugs[sugs.length - 1].cost;
        }
    }

    processTries(trie.c, 1);
    sugs.sort((a, b) => a.cost - b.cost);
    return sugs;
}

export function suggestAlt(trie: Trie, word: string, numSuggestions: number = defaultNumberOfSuggestions): SuggestionResult[] {
    let costLimit = Math.min(baseCost * word.length / 2, baseCost * maxNumChanges);

    const sugs: SuggestionResult[] = [];

    const matrix: number[][] = [[]];
    const x = ' ' + word;
    const mx = x.length - 1;
    const curSug: string[] = [''];

    for (let i = 0; i <= mx; ++i) {
        matrix[0][i] = i * baseCost;
    }

    function processTrie(trie: TrieNode, d: number) {
        const bc = baseCost;
        const psc = postSwapCost;
        const { w, c } = trie;
        if (! w) {
            const cost = matrix[d - 1][mx];
            if (cost <= costLimit) {
                emitSug({ word: curSug.slice(1, d).join(''), cost });
            }
        } else {
            curSug[d] = w;
            const lastSugLetter = curSug[d - 1];
            matrix[d] = matrix[d] || [];
            let diag = matrix[d - 1][0];
            matrix[d][0] = diag + bc;
            let lastLetter = x[0];
            let min = matrix[d][0];
            let lastCost = min;
            // declare these here for performance reasons
            let curLetter, subCost, above;
            for (let i = 1; i <= mx; ++i) {
                curLetter = x[i];
                subCost = (w === curLetter) ? 0 : (curLetter === lastSugLetter && w === lastLetter ? psc : bc);
                above = matrix[d - 1][i];
                lastCost = Math.min(
                    diag + subCost,     // substitute
                    above + bc,   // insert
                    lastCost + bc // delete
                );
                diag = above;
                matrix[d][i] = lastCost;
                min = Math.min(min, lastCost);
                lastLetter = curLetter;
            }
            if (min <= costLimit) {
                processTries(c, d + 1);
            }
        }
    }

    function processTries(tries: TrieMap | undefined, d: number) {
        if (tries) {
            for (const trie of tries.values()) {
                processTrie(trie, d);
            }
        }
    }

    function emitSug(sug: SuggestionResult) {
        sugs.push(sug);
        if (sugs.length > numSuggestions) {
            sugs.sort((a, b) => a.cost - b.cost);
            sugs.length = numSuggestions;
            costLimit = sugs[sugs.length - 1].cost;
        }
    }

    processTries(trie.c, 1);
    sugs.sort((a, b) => a.cost - b.cost);
    return sugs;
}