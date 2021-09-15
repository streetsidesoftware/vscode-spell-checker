# Spell Checker FAQ

This is a place to capture common questions and possible confusions. Please feel free to make suggestion for things to be added to this file.

See: [FAQ Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues?utf8=%E2%9C%93&q=label%3AFAQ+)

## Things to know

### _Is the spell checker case sensitive?_

> The spell checker is NOT case sensitive.

### _What files are excluded by the spell checker?_

> By default the spell checker excludes the same files excluded by the VS Code _search.exclude_ setting. See discussion: [#16](https://github.com/streetsidesoftware/vscode-spell-checker/issues/16), [#55](https://github.com/streetsidesoftware/vscode-spell-checker/issues/55) and [#95](https://github.com/streetsidesoftware/vscode-spell-checker/issues/95)

### _Does the spell checker use any online services?_

> No, the spell checker is self contained. It does not send your code off to a service to be checked.

### _Can I use the spell checker with other languages like Spanish or French?_

> Yes, please visit [cspell-dicts](https://github.com/Jason3S/cspell-dicts).
> See also: [#119](https://github.com/streetsidesoftware/vscode-spell-checker/issues/119)

### _Is it possible to only spell check comments_

> Yes. It is necessary to define `includeRegExpList` for each language. See [#107](https://github.com/streetsidesoftware/vscode-spell-checker/issues/107) and [#116](https://github.com/streetsidesoftware/vscode-spell-checker/issues/116)

### Can I use the spell checker as a linter or part of the build process?

> Yes you can: [Spell Checker as Npm package #137](https://github.com/streetsidesoftware/vscode-spell-checker/issues/137)

### Can I remove a word from the dictionary?

> [How to remove word from dictionary? #117](https://github.com/streetsidesoftware/vscode-spell-checker/issues/117)

### Can I add a many words to the dictionary at once?

> Yes, select the words and right click to get the menu. Choose `Add Word to Dictionary` or `Add Word to Global Dictionary`. [Add all words in the current document to dictionary #59](https://github.com/streetsidesoftware/vscode-spell-checker/issues/59)

### Can I ignore words.

> See: [Option to ignore words #146](https://github.com/streetsidesoftware/vscode-spell-checker/issues/146)
