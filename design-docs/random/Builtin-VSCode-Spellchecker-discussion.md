# Discussion about built in spell checker for VS Code

This is part of the discussion around making a build-in spell checker.

Hello

I'm the author of [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) extension and [cspell](https://www.npmjs.com/package/cspell) linter (used by the extension).

## Why

I did not intend to write a spell checker. I wrote it because I needed one that worked with source code and didn't find a built in checker. So the fact that you are considering having a spell checker built in is wonderful. It would have saved me a bunch of effort. :-)

To be honest, it was a fun exercise. It needed to load fast and execute fast. It needed to limit memory consumption and work with very large dictionaries. Spelling suggestions needed to be quick and applicable. Importantly, I wanted it to run on all platforms. I was able to achieve all of these things.

## How it works

I did not choose any of the Hunspell solutions due to speed and memory concerns. The Hunspell format is designed for compact representation of words with common prefix and suffix patterns. The Hunspell _.dic_ and _.aff_ are deliberately easy for adding words by hand. The format is not designed for easy lookup or searching. Which is why the open source javascript solutions are very slow and use a lot of memory.

Instead I wrote a hunspell file reader that would output all the word combinations. This list of words is compiled into a compact format designed for lookup speed and calculating suggestions. At its core is a [Trie](https://en.wikipedia.org/wiki/Trie) which is optimized into a [Deterministic Acyclic Finite State Automaton](https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton).

This process of compiling is rather expensive, which is why it is done offline and only the compiled dictionaries are shipped with the extension.

### Word Lookup and Suggestions

Word lookup is _O(m)_ where _m_ is the length of the word. It is a very simple process of walking the _Trie_. Suggestions are done using a modified Levenshtein algorithm that minimizes recalculation and culls candidates by not walking down branches in the _Trie_ whose minimum possible error is greater than the allowed error threshold.

## Things to consider

Most of the work was not writing the spell checker. Checking words and making spelling suggestions is rather easy. Most of the work came from the configuration options. Where possible, the system is configuration driven.

Each programming language has its own combination of dictionaries and settings. In the linter fashion, the spell checker also allows for in code flags and settings.

### Programming Language Dictionaries

I ended up creating dictionaries that included keywords and common symbols for several programming languages. These dictionaries can be combined based upon the context.

For example a _.cpp_ file will use the following dictionaries: _cpp_, _companies_, _softwareTerms_, _misc_, _filetypes_, and _wordsEn_.

As you can see, I even needed a dictionary for common software terms, because standard Hunspell dictionaries do not include most software terms.

### Programming Language Grammar awareness

I did not make my spell checker aware of the programming language grammar or syntax. There are some really cool things that are possible. Like having strings be in French while the code is in English and the comments are in Spanish. Other things like not spell checking 3rd party imports. Yet, I found this more work than I had time to spend.

As an extension writer, I was wishing for access to the language grammar used by the colorizers.

## Linter Style

I think it is worth noting that a spell checker is usable in a Continuous Integration environment. Think of it as anyplace you might want to use _tslint_ a spell checker might be useful.

# Questions

1. How do you plan on parsing the code to send it to the spell checker? Spell checkers do not like camelCase or snake_case.
2. How do you plan on solving the multi language issue? Where the code and comments are in English while the strings are in Spanish?
3. If a users add their own words to the dictionary, will they be included in the suggestions?
4. Reading the discussion, it looks like the plan is to call the spell checker one word at a time. Won't that be very slow?
