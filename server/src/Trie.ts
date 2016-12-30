export class TrieMap extends Map<string, TrieNode> {};

/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface TrieNode {
    k: number;
    w: string;
    c?: TrieMap;
}

/**
 * See: https://en.wikipedia.org/wiki/Trie
 */
export interface Trie {
    c: TrieMap;
}

let trieNextId = 1;

/**
 *
 */
export function addWordToTrie(trie: Trie, word: string): Trie {
    function buildTrie(word: string, trieNodes: TrieMap = new TrieMap()): TrieMap {
        const head = word.slice(0, 1);
        const tail = word.slice(1);
        const found = trieNodes.get(head);
        if (found) {
            found.c = head ? buildTrie(tail, found.c) : found.c;
        } else {
            const c = head ? buildTrie(tail) : undefined;
            const node: TrieNode = { k: trieNextId++, w: head, c };
            trieNodes.set(head, node);
        }

        return trieNodes;
    }

    const children = buildTrie(word, trie.c);

    return { c: children };
}


export function wordListToTrie(words: string[]): Trie {
    const trie: Trie = createTrie();
    for (const word of words) {
        addWordToTrie(trie, word);
    }

    return trie;
}

export function wordsToTrie(words: Rx.Observable<string>): Rx.Promise<Trie> {
    const trie: Trie = createTrie();
    return words
        .reduce(addWordToTrie, trie)
        .toPromise();
}

export function createTrie(): Trie {
    return { c: new TrieMap() };
}
