# Text Validation

The purpose of the validator functions are to help with checking a document for spelling errors.

## Enhancements

### Selective Validation

#### Problem Statement

There are some files or file types where we only want to spell check strings or comments.

#### Challenges

-   How to specify which files get special filtering
-   How to define the inclusion / exclusion rules

#### Thoughts

-   Use Regex
-   Should we use syntax highlighting expressions? This might make things easier, but it means we need to find a way to import them.
-   There are two types of rules, global and nested. A global exclusion rule might exclude urls for example.
