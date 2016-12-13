import * as Rx from 'rx';


interface CompiledWords {
    setOfWords: Set<string>;

}

export function wordListCompiler(words: Rx.Observable<string>): Rx.Promise<string> {
    return words
        .reduce((acc: CompiledWords, word) => {
            acc.setOfWords.add(word);
            return acc;
        }, { setOfWords: new Set<string>() })
        .map(compiledWordsToTs)
        .toPromise();
}


function compiledWordsToTs(cw: CompiledWords): string {
    const jsonWords = JSON.stringify([...cw.setOfWords.values()]);
    return `
    const export words = ${jsonWords};
    const export setOfWords = new Set(words);
`;
}

