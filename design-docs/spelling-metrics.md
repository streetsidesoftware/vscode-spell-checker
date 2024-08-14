# Spelling Metrics and Usage data

The goal of collecting spelling metrics is to improve the overall user experience.

## Improving Spelling Suggestions

The goal is to improve the spelling suggestions presented to the user.
The idea is present the "best" choices higher on the list than other choices.
The current algorithm uses only a modified edit distance algorithm to move some choices higher.
By collecting the choices the user has used in the past and word usage frequency we can adjust the order.

## Collect Spelling Corrections

Fixing spelling errors is usually done with a Command. The idea is to record each time the command is used to replace a spelling error.

Things to record:

-   `word`<sup>\*</sup> - the word with the spelling error. This could be the word or a hash.
-   `replacement`<sup>\*</sup> - the replacement chosen. This could be a word or a hash.
-   `timestamp` - the Unix timestamp in milliseconds. Helps use keep track of the order and to diminish weight over time.
-   `fileType` - the file type (LanguageID) of the file.
-   `locale` - the current locale setting.
-   `scheme` - the URI scheme
-   `machineId` - a hash of the machine id (does not need to be unique, just consistent).
-   `userId` - a hash of the user id (does not need to be unique, just consistent).

<sup>\*</sup> - Necessary fields needed to make the suggestions.

## Word Frequency Data

Word Frequency can be used to improve suggestions by pushing words that already exist in the project towards the top.

Record:

-   `word` - the text of the word. (prefer whole words over camel case splits). We might want to limit the length less than 64 characters or use a hash.
-   `count` - the number of times the word was seen in the file.
-   `fileType` - the file type (LanguageId) of the file.
-   `fileId` - the id of the file
