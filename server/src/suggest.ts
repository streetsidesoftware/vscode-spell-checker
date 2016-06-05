/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface TrieNode {
    k: number;
    w: string;
    c: TrieNode[];
}

/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface Trie {
    c: TrieNode[];
}

const baseCost = 100;

export interface SuggestionResult {
    word: string;
    cost: number;
}

const maxNumChanges = 4;

let trieNextId = 1;

/**
 *
 */
export function addWordToTrie(trie: Trie, word: string): Trie {
    function buildTrie(word: string, trieNodes: TrieNode[]) {
        const head = word.slice(0, 1);
        const tail = word.slice(1);
        const found = trieNodes.find(t => t.w === head);
        if (found) {
            found.c = head ? buildTrie(tail, found.c) : found.c;
        } else {
            const children = head ? buildTrie(tail, []) : [];
            const node: TrieNode = { k: trieNextId++, w: head, c: children };
            trieNodes.push(node);
        }

        return trieNodes;
    }

    const children = buildTrie(word, trie.c);

    return { c: children };
}


export function wordListToTrie(words: string[]): Trie {
    let trie: Trie = { c: [] }
    for (const word of words) {
        trie = addWordToTrie(trie, word);
    }

    return trie;
}

export function wordsToTrie(words: Rx.Observable<string>): Rx.Promise<Trie> {
    const trie: Trie = { c: [] };
    return words
        .reduce(addWordToTrie, trie)
        .toPromise();
}


export function suggest(trie: Trie, word: string, numSuggestions: number = 10): SuggestionResult[] {
    let costLimit = Math.min(baseCost * word.length / 2, baseCost * maxNumChanges);

    const sugs: SuggestionResult[] = [];

    const matrix: number[][] = [[]];
    const x = (' ' + word).split('');
    const mx = x.length - 1;
    const curSug: string[] = [''];

    for (let i = 0; i <= mx; ++i) {
        matrix[0][i] = i * baseCost;
    }

    function *processTrie(trie: TrieNode, d: number): IterableIterator<SuggestionResult> {
        const { w, c } = trie;
        if (! w) {
            const cost = matrix[d - 1][mx];
            if (cost <= costLimit) {
                yield { word: curSug.slice(1, d).join(''), cost };
            }
        } else {
            curSug[d] = w;
            matrix[d] = [];
            matrix[d][0] = matrix[d - 1][0] + baseCost;
            for (let i = 1; i <= mx; ++i) {
                const subCost = w === x[i] ? 0 : baseCost;
                matrix[d][i] = Math.min(
                    matrix[d - 1][i - 1] + subCost, // substitute
                    matrix[d - 1][i] + baseCost,    // insert
                    matrix[d][i - 1] + baseCost     // delete
                );
            }
            if (Math.min(...matrix[d]) <= costLimit) {
                yield *processTries(c, d + 1);
            }
        }
    }

    function *processTries(tries: TrieNode[], d: number): IterableIterator<SuggestionResult> {
        for (const trie of tries) {
            yield *processTrie(trie, d);
        }
    }

    for (const sug of processTries(trie.c, 1)) {
        sugs.push(sug);
        if (sugs.length > numSuggestions) {
            sugs.sort((a, b) => a.cost - b.cost);
            sugs.length = numSuggestions;
        }
    }

    sugs.sort((a, b) => a.cost - b.cost);
    return sugs;
}